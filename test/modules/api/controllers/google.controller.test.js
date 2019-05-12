/* eslint-disable no-undef,global-require,node/no-unpublished-require */
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

describe('GET /api/v1/auth/google/redirect-url', () => {

  it('should receive valid url', async () => {
    const response = await agent.get('/api/v1/auth/google/redirect-url');
    isSuccess(response);
    chai.expect(response.body.result).to.have.pathname('/o/oauth2/v2/auth');
    chai.expect(response.body.result).to.have.protocol('https');
  });

});

describe('POST /api/v1/auth/google/code', () => {

  it('should success with valid code', async () => {
    const response = await agent.post('/api/v1/auth/google/code').send({
      code: constants.modules.api.auth.googleValidCode
    });
    isSuccess(response);
    assert.deepEqual(response.body.result, {
      id: response.body.result.id,
      username: constants.modules.api.auth.googleTestUsername,
      youtube: '',
      facebook: '',
      peerplaysAccountName: '',
      bitcoinAddress: '',
      avatar: constants.modules.api.auth.googleTestPicture
    });
  });

  it('should success with valid code and authorized user', async () => {
    const response = await agent.post('/api/v1/auth/google/code').send({
      code: constants.modules.api.auth.googleValidCode
    });
    isSuccess(response);
    assert.deepEqual(response.body.result, {
      id: response.body.result.id,
      username: constants.modules.api.auth.googleTestUsername,
      youtube: '',
      facebook: '',
      peerplaysAccountName: '',
      bitcoinAddress: '',
      avatar: constants.modules.api.auth.googleTestPicture
    });
  });

  it('should success with valid code and non authorized user witch already exists', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/auth/google/code').send({
      code: constants.modules.api.auth.googleValidCode
    });
    isSuccess(response);
    assert.deepEqual(response.body.result, {
      id: response.body.result.id,
      username: constants.modules.api.auth.googleTestUsername,
      youtube: '',
      facebook: '',
      peerplaysAccountName: '',
      bitcoinAddress: '',
      avatar: constants.modules.api.auth.googleTestPicture
    });
  });

  it('should error without code', async () => {
    await agent.post('/api/v1/auth/google/logout');
    const response = await agent.post('/api/v1/auth/google/code').send({});
    isError(response, 400);
  });

  it('should error with invalid code', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/auth/google/code').send({
      code: 'invalid'
    });
    isError(response, 400);
  });

});

after(async () => {
  await apiModule.close();
});
