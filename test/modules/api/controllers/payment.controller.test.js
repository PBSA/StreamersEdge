process.env.NODE_ENV = 'test';
const assert = require('assert');
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
  try {
    apiModule = await ApiModule();
    agent = request.agent(apiModule.app);
    // await TestDbHelper.truncateAll(apiModule);
  }catch (e) {
    console.log('Error occurred');
    console.error(e);
  }

});

describe('POST /api/v1/payment', () => {

  const validObject = {
    email: 'test@testnew.com',
    username: 'test1234',
    password: 'testtesttesT@0',
    repeatPassword: 'testtesttesT@0'
  };

  const validSingInObj = {
    login: validObject.email,
    password: validObject.password
  };

  before(async () => {
    await agent.post('/api/v1/auth/logout');
  });

  it('should forbid, user not logged', async () => {
    const response = await agent.post('/api/v1/payment').send();
    isError(response, 401);
  });

  it('should forbid. empty body', async () => {
    await agent.post('/api/v1/auth/logout');
    const res = await agent.post('/api/v1/auth/sign-up').send(validObject);
    const {token} = await apiModule.dbConnection.sequelize.models['verification-tokens'].findOne({
      where: {userId: res.body.result.id}
    });
    await agent.get(`/api/v1/auth/confirm-email/${token}`);
    await agent.post('/api/v1/auth/sign-in').send(validSingInObj);
    const response = await agent.post('/api/v1/payment').send();
    isError(response, 400);
  });

  it('should forbid. orderId should be a string', async () => {
    const orderId = 12;
    const response = await agent.post('/api/v1/payment').send({orderId: orderId});
    isError(response, 400);
  });

  it('should forbid. orderId length should be less than 254', async () => {
    const orderId = '12'.repeat(255);
    const response = await agent.post('/api/v1/payment').send({orderId: orderId});
    isError(response, 400);
  });

  it('should success with error. User does not have peerplays account', async () => {
    const orderId = '7D983959BX7281444';
    const response = await agent.post('/api/v1/payment').send({orderId: orderId});
    isSuccess(response);
    assert.strictEqual(response.body.result[0].error, 'User does not have peerplays account');
  });

  it('should success. valid request after adding account', async () => {
    const orderId = '2MU795672V989411N';
    const res = await agent.post('/api/v1/payment').send({orderId: orderId});
    assert.strictEqual(res.body.result[0].error, 'User does not have peerplays account');
    await agent.post('/api/v1/profile/peerplays/create-account').send({
      name: constants.modules.api.profile.validPeerplaysName,
      activeKey: constants.modules.api.profile.validPeerplaysKey,
      ownerKey: constants.modules.api.profile.validPeerplaysKey
    });
    const orderI = '9777786734429090V';
    const response = await agent.post('/api/v1/payment').send({orderId: orderI});
    isSuccess(response);
  });

  it('should forbid. Purchase already processed', async () => {
    const orderId = '9777786734429090V';
    await agent.post('/api/v1/payment').send({orderId: orderId});
    const sameOrderIdRequest = await agent.post('/api/v1/payment').send({orderId: orderId});
    isError(sameOrderIdRequest, 400);
    assert.strictEqual(sameOrderIdRequest.body.error, 'Purchase already processed');
  });

  it('should success. valid request', async () => {
    const orderId = '2C887053J7102740X';
    const response = await agent.post('/api/v1/payment').send({orderId: orderId});
    isSuccess(response);
  });

});

after(async () => {
  await apiModule.close();
});
