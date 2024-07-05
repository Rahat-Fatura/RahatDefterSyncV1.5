const backend = require('../instances/rahatdefter.instance');

const sendFileToService = async ({ filePath, fileB64 }) => {
  const response = await backend.post('/v2/savedbooks/uploadfile', { path: filePath, file: fileB64 });
  return response.data;
};

const checkFilesFromService = async ({ array }) => {
  const response = await backend.post('/v2/savedbooks/checkfile', { array });
  return response.data;
};

const checkFileFromService = async ({ filename, mimetype, hash }) => {
  const response = await backend.post('/api/upload/check.file', { filename, mimetype, hash });
  return response.data;
};

const sendFileToServiceV2 = async ({ filename, mimetype, data }) => {
  const response = await backend.post('/api/upload/book.b64', { filename, mimetype, data });
  return response.data;
};

module.exports = {
  sendFileToService,
  checkFilesFromService,
  checkFileFromService,
  sendFileToServiceV2,
};
