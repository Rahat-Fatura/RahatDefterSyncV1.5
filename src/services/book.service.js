/* eslint-disable security/detect-non-literal-fs-filename */
const fs = require('fs');
const crypto = require('crypto');
const mime = require('mime-types');
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

const fileToBase64 = (filePath) => fs.readFileSync(filePath).toString('base64');
const b64ToHash = (b64) => crypto.createHash('sha256').update(Buffer.from(b64, 'base64')).digest('hex');

const checkAndSendAllFilesFromPath = async (path) => {
  try {
    const fileList = await listFilesRecursiveByMimeType(path, ['application/zip', 'application/xml']);
    const arrayForCheckingFiles = [];
    const arrayForSendingFiles = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const file of fileList) {
      const fileB64 = fileToBase64(file);
      const fileHash = b64ToHash(fileB64);
      arrayForCheckingFiles.push({ hash: fileHash, path: file });
      arrayForSendingFiles.push({ file: fileB64, path: file });
    }
    logger.info(`İşlem başladı. Toplam tespit edilen dosya sayısı: ${arrayForCheckingFiles.length}`);
    let didNotSendFiles = [];
    try {
      didNotSendFiles = (await backendService.checkFilesFromService({ array: arrayForCheckingFiles })).data;
    } catch (error) {
      logger.error(`didNotSendFilesError :>> ${error}`);
    }
    logger.info(`Gönderilecek olan dosya sayısı: ${didNotSendFiles.length}`);
    const didNotSendFilesPaths = didNotSendFiles.map((file) => file.path);
    const filesToSend = arrayForSendingFiles.filter((file) => didNotSendFilesPaths.includes(file.path));
    // eslint-disable-next-line no-restricted-syntax
    for (const file of filesToSend) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await backendService.sendFileToService({ fileB64: file.file, filePath: file.path });
      } catch (error) {
        logger.error(`sendFileToServiceError :>> filename: ${file.path}, error: ${error}`);
      }
    }
  } catch (error) {
    logger.error(`checkAndSendAllFilesFromPath :>> ${error}`);
  }
};

module.exports = {
  checkAndSendAllFilesFromPath,
};
