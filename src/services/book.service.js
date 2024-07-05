/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime-types');
const AdmZip = require('adm-zip');
const logger = require('../config/logger');
const backendService = require('./rahatdefter.service');

const listFilesRecursiveByMimeType = async (path, mimeTypes) => {
  const files = fs.readdirSync(path);
  let fileList = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const file of files) {
    const filePath = `${path}/${file}`;
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      fileList = fileList.concat(await listFilesRecursiveByMimeType(filePath, mimeTypes));
    } else {
      const mimeType = mime.lookup(filePath);
      if (mimeTypes.includes(mimeType)) {
        fileList.push(filePath);
      }
    }
  }
  return fileList;
};

const checkAndSendAllFilesFromPath = async (path) => {
  try {
    const allFileList = await listFilesRecursiveByMimeType(path, ['application/zip']);
    logger.info(`checkAndSendAllFilesFromPath :>> Started, allFileListLength: ${allFileList.length}`);
    // eslint-disable-next-line no-restricted-syntax
    for (const zipPath of allFileList) {
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();
      if (zipEntries.length !== 1) {
        logger.error(`zipEntriesLengthError :>> ${zipPath}, length: ${zipEntries.length}`);
        continue;
      }
      const file = zipEntries[0];
      if (!file.entryName.endsWith('.xml')) {
        logger.error(`zipEntriesXmlError :>> ${zipPath}, entryName: ${file.entryName}`);
        continue;
      }
      const content = zip.readAsText(file);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      const filename = zipPath.split('/').pop().split('\\').pop();
      const mimetype = mime.lookup(filename);
      try {
        await backendService.checkFileFromService({ filename, mimetype, hash });
        await backendService.sendFileToServiceV2({ filename, mimetype, data: zip.toBuffer().toString('base64') });
      } catch (error) {
        if (error.response.status === 404) {
          try {
            await backendService.sendFileToServiceV2({ filename, mimetype, data: zip.toBuffer().toString('base64') });
          } catch (e) {
            if (e.response.status !== 404 && e.response.status !== 422)
              logger.error(`sendFileToServiceError :>> ${zipPath}, error: ${e.response.data.message}`);
          }
        } else if (error.response.status !== 404 && error.response.status !== 422)
          logger.error(`sendFileToServiceError :>> ${zipPath}, error: ${error.response.data.message}`);
      }
    }
    logger.info('checkAndSendAllFilesFromPath :>> Finished');
  } catch (error) {
    logger.error(`checkAndSendAllFilesFromPath :>> ${error}`);
  }
};

module.exports = {
  checkAndSendAllFilesFromPath,
};
