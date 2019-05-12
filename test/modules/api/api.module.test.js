process.env.NODE_ENV = 'test';
const {initModule} = require('../../../src/awilix');

let apiModule;

module.exports = async () => {
  if (!apiModule) {
    apiModule = await initModule('api.module');
  }

  return apiModule;
};
