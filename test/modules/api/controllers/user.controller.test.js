process.env.NODE_ENV = 'test';
const {assert} = require('chai');
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

describe('GET /api/v1/user/:id', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/twitch/code').send({code: constants.modules.api.auth.twitchValidCode});
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.get('/api/v1/user/1');
    isError(response, 401);
  });

  it('should forbid, invalid id', async () => {
    const response = await agent.get('/api/v1/user/test');
    isError(response, 400);
  });

  it('should forbid, user not found', async () => {
    const response = await agent.get('/api/v1/user/1000');
    isError(response, 404);
  });

  it('should success', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.get(`/api/v1/user/${profile.id}`);
    isSuccess(response);
    assert.deepEqual(response.body.result, profile);
  });

});

after(async () => {
  await apiModule.close();
});
