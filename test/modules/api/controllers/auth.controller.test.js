process.env.NODE_ENV = 'test';
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');

const {isSuccess, isError} = require('../helpers/test.response.helper');
const ApiModule = require('../api.module.test');
const constants = require('../../../constants.json');

chai.use(chaiHttp);
let agent;
let apiModule;

before(async () => {
  apiModule = await ApiModule();
  agent = request.agent(apiModule.app);
});

describe('POST /api/v1/auth/logout', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/logout');
  });

  it('should forbid. only authorized user', async () => {
    const response = await agent.post('/api/v1/auth/logout');
    isError(response, 401);
  });

  it('should success. valid request', async () => {
    await agent.post('/api/v1/auth/twitch/code').send({
      code: constants.modules.api.auth.twitchValidCode
    });
    const response = await agent.post('/api/v1/auth/logout');
    isSuccess(response);
  });

});

after(async () => {
  await apiModule.close();
});
