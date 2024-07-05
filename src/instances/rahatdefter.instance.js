const axios = require('axios');
const config = require('../config/config');

const url = config.get('url');
const backend = axios.create({
  baseURL: url,
});

backend.interceptors.request.use((request) => {
  request.headers['Content-Type'] = 'application/json';
  request.headers['x-api-key'] = config.get('uuid');
  return request;
});

backend.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Servise erişilemiyor.');
    }
    throw error;
  },
);

module.exports = backend;
