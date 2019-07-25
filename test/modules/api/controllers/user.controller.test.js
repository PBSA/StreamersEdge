process.env.NODE_ENV = 'test';
const {assert} = require('chai');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');

const {isSuccess, isError} = require('../helpers/test.response.helper');
const {login} = require('../helpers/test.login.helper');
const ApiModule = require('../api.module.test');
const constants = require('../../../constants.json');

chai.use(chaiHttp);
let agent;
let apiModule;

before(async () => {
  apiModule = await ApiModule();
  agent = request.agent(apiModule.app);
});

describe('GET /api/v1/users/:id', () => {

  beforeEach(async () => {
    await login(agent, null, apiModule);
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.get('/api/v1/users/1');
    isError(response, 401);
  });

  it('should forbid, invalid id', async () => {
    const response = await agent.get('/api/v1/users/test');
    isError(response, 400);
  });

  it('should forbid, user not found', async () => {
    const response = await agent.get('/api/v1/users/1000');
    isError(response, 404);
  });

  it('should success', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.get(`/api/v1/users/${profile.id}`);
    isSuccess(response);
    assert.deepEqual(response.body.result, profile);
  });

});

describe('GET /api/v1/users', () => {

  const validObject = {
    email: 'test@test.com',
    username: 'test123',
    password: 'testtesttest',
    repeatPassword: 'testtesttest'
  };

  const validSingInObj = {
    login: validObject.email,
    password: validObject.password
  };

  beforeEach(async () => {
    await login(agent, null, apiModule);
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.get('/api/v1/users');
    isError(response, 401);
  });

  it('should success return list', async () => {
    const response = await agent.get('/api/v1/users?limit=100');
    isSuccess(response);
    assert.ok(response.body.result.length > 0);
  });

  it('should success return one user', async () => {
    await agent.post('/api/v1/profile/peerplays/create-account').send({
      name: constants.modules.api.profile.validPeerplaysName,
      activeKey: constants.modules.api.profile.validPeerplaysKey,
      ownerKey: constants.modules.api.profile.validPeerplaysKey
    });
    const response = await agent.get('/api/v1/users?limit=1&search=test');
    isSuccess(response);
    assert.ok(response.body.result.length === 1);
  });

  it('should success return two user', async () => {
    await agent.post('/api/v1/auth/logout');
    const res = await agent.post('/api/v1/auth/sign-up').send(validObject);
    const {token} = await apiModule.dbConnection.sequelize.models['verification-token'].findOne({
      where: {userId: res.body.result.id}
    });
    await agent.get(`/api/v1/auth/confirm-email/${token}`);
    await agent.post('/api/v1/auth/sign-in').send(validSingInObj);
    await agent.post('/api/v1/profile/peerplays/create-account').send({
      name: constants.modules.api.profile.validPeerplaysName,
      activeKey: constants.modules.api.profile.validPeerplaysKey,
      ownerKey: constants.modules.api.profile.validPeerplaysKey
    });

    const response = await agent.get('/api/v1/users?limit=2&search=test');
    isSuccess(response);
    assert.ok(response.body.result.length === 2);
  });

  it('should success return empty list', async () => {
    const response = await agent.get('/api/v1/users?limit=1&search=not-exists-user');
    isSuccess(response);
    assert.ok(response.body.result.length === 0);
  });

});

after(async () => {
  await apiModule.close();
});
