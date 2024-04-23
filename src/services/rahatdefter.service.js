const backend = require('../instances/rahatdefter.instance');

const sendFileToService = async ({ filePath, fileB64 }) => {
  const response = await backend.post('/v2/savedbooks/uploadfile', { path: filePath, file: fileB64 });
  return response.data;
};

const checkFilesFromService = async ({ array }) => {
  const response = await backend.post('/v2/savedbooks/checkfile', { array });
  return response.data;
};

module.exports = {
  sendFileToService,
  checkFilesFromService,
};
