const config = require('config');

module.exports = {
  info: {
    title: 'StreamerEdge',
    version: '1',
    description: 'APIs for StreamerEdge'
  },
  host: config.swagger.host,
  apis: [
    'src/errors/*.js',
    'src/modules/api/controllers/*.js',
    'src/modules/api/api.module.js',
    'src/models/*.js'
  ],
  basePath: '/api/v1',
  schemes: config.swagger.schemes
};
