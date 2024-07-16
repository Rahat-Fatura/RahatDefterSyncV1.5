/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime-types');
const AdmZip = require('adm-zip');
const logger = require('../config/logger');
const backendService = require('./rahatdefter.service');

const sendXmlContentToService = async ({ path, content, filename, fileEntryName }) => {
  const hash = crypto.createHash('sha256').update(content).digest('hex');
  const mimetype = 'application/zip';
  let zipBuffer;
  try {
    await backendService.checkFileFromService({ filename, mimetype, hash });
    const fileZipped = new AdmZip();
    fileZipped.addFile(fileEntryName, Buffer.from(content));
    zipBuffer = fileZipped.toBuffer().toString('base64');
    await backendService.sendFileToServiceV2({ filename, mimetype, data: zipBuffer });
  } catch (error) {
    if (error.response.status === 404) {
      try {
        if (!zipBuffer) {
          const fileZipped = new AdmZip();
          fileZipped.addFile(fileEntryName, Buffer.from(content));
          zipBuffer = fileZipped.toBuffer().toString('base64');
        }
        await backendService.sendFileToServiceV2({ filename, mimetype, data: zipBuffer });
      } catch (e) {
        if (e.response.status !== 404 && e.response.status !== 422)
          logger.error(
            `sendFileToServiceErrorAfter404 :>> ${path}, inner filename: ${fileEntryName} error: ${e.response.data.message}`,
          );
      }
    } else if (error.response.status !== 404 && error.response.status !== 422)
      logger.error(
        `sendFileToServiceError :>> ${path}, inner filename: ${fileEntryName}, error: ${error.response.data.message}`,
      );
  }
};

const exportAndSendFromZip = async (zip, zipPath) => {
  const zipEntries = zip.getEntries();
  // eslint-disable-next-line no-restricted-syntax
  for (const file of zipEntries) {
    if (file.isDirectory) continue;
    if (!file.name.endsWith('.xml') && !file.name.endsWith('.zip')) continue;
    if (file.name.endsWith('.zip')) {
      try {
        const zb = new AdmZip(file.getData());
        await exportAndSendFromZip(zb, `${zipPath}/${file.entryName}`);
      } catch (error) {
        logger.error(`exportAndSendFromZipError :>> ${zipPath}/${file.entryName}, error: ${error}`);
      }
    } else {
      const xmlPath = `${zipPath}/${file.entryName}`;
      const content = zip.readAsText(file);
      const filename = `${file.name.split('.').slice(0, -1).join('.')}.zip`;
      const fileEntryName = file.name;
      await sendXmlContentToService({ path: xmlPath, content, filename, fileEntryName });
    }
  }
};

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

const checkAndSendAllFilesFromPath = async (paths) => {
  logger.info(`checkAndSendAllFilesFromPath :>> Started with ${paths.length} paths`);
  // eslint-disable-next-line no-restricted-syntax
  for (const path of paths) {
    logger.info(`checkAndSendAllFilesFromPath :>> Started for ${path}`);
    try {
      const allFileList = await listFilesRecursiveByMimeType(path, ['application/zip', 'application/xml', 'text/xml']);
      logger.info(`checkAndSendAllFilesFromPath :>> Started, allFileListLength from ${path}: ${allFileList.length}`);
      // eslint-disable-next-line no-restricted-syntax
      for (const fp of allFileList) {
        try {
          if (fp.endsWith('.xml')) {
            const content = fs.readFileSync(fp, 'utf8');
            const filename = `${fp.split('/').slice(-1)[0].split('.').slice(0, -1).join('.')}.zip`;
            const fileEntryName = fp.split('/').slice(-1)[0];
            await sendXmlContentToService({ path: fp, content, filename, fileEntryName });
          } else {
            const zb = new AdmZip(fp);
            await exportAndSendFromZip(zb, fp);
          }
        } catch (error) {
          logger.error(`exportAndSendFromZipError :>> ${fp}, error: ${error}`);
        }
      }
      logger.info(`checkAndSendAllFilesFromPath :>> Finished for ${path}`);
    } catch (error) {
      logger.error(`checkAndSendAllFilesFromPath :>> ${error}`);
    }
  }
};

module.exports = {
  checkAndSendAllFilesFromPath,
};
