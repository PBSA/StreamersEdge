process.env.NODE_ENV = 'test';
const {assert} = require('chai');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');
const path = require('path');

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
  // await TestDbHelper.truncateAll(apiModule);
});

describe('GET /api/v1/profile', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/logout');
  });

  it('should forbid, user not logged', async () => {
    const response = await agent.get('/api/v1/profile');
    isError(response, 401);
  });

  it('should success. User logged', async () => {
    await login(agent, null, apiModule);
    const response = await agent.get('/api/v1/profile');
    isSuccess(response);
    assert.deepEqual(response.body.result, {
      id: response.body.result.id,
      username: 'test-global',
      email: 'testglobal@email.com',
      googleName: null,
      twitchUserName: null,
      userType: null,
      pubgUsername: null,
      avatar: '',
      invitations: 'all',
      notifications: true,
      youtube: '',
      twitch: '',
      facebook: '',
      peerplaysAccountName: 'se-test-global',
      bitcoinAddress: ''
    });
  });

});


describe('PATCH /api/v1/profile', () => {

  beforeEach(async () => {
    await login(agent, null, apiModule);
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.patch('/api/v1/profile').send({});
    isError(response, 401);
  });

  it('should success, empty request', async () => {
    const response = await agent.patch('/api/v1/profile').send({});
    isSuccess(response);
  });

  it('should forbid, invalid data', async () => {
    const response = await agent.patch('/api/v1/profile').send({
      youtube: '-',
      facebook: '-',
      peerplaysAccountName: '-',
      bitcoinAddress: '-'
    });
    isError(response, 400);
  });

  it('should success, youtube only', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.patch('/api/v1/profile').send({
      youtube: constants.modules.api.profile.youtubeLink
    });
    isSuccess(response);
    profile.youtube = constants.modules.api.profile.youtubeLink;
    assert.deepEqual(response.body.result, profile);
  });

  it('should success, twitch only', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.patch('/api/v1/profile').send({
      twitch: constants.modules.api.profile.twitchLink
    });
    isSuccess(response);
    profile.twitch = constants.modules.api.profile.twitchLink;
    assert.deepEqual(response.body.result, profile);
  });

  it('should success, facebook only', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.patch('/api/v1/profile').send({
      facebook: constants.modules.api.profile.facebookLink
    });
    isSuccess(response);
    profile.facebook = constants.modules.api.profile.facebookLink;
    assert.deepEqual(response.body.result, profile);
  });

  it('should success, peerplays only', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.patch('/api/v1/profile').send({
      peerplaysAccountName: constants.modules.api.profile.peerplaysAccount
    });
    isSuccess(response);
    profile.peerplaysAccountName = constants.modules.api.profile.peerplaysAccount;
    assert.deepEqual(response.body.result, profile);
  });

  it('should success, bitcoin address only', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.patch('/api/v1/profile').send({
      bitcoinAddress: constants.modules.api.profile.validBitcoinAddress
    });
    isSuccess(response);
    profile.bitcoinAddress = constants.modules.api.profile.validBitcoinAddress;
    assert.deepEqual(response.body.result, profile);
  });

  it('should forbid, bitcoin address invalid', async () => {
    const response = await agent.patch('/api/v1/profile').send({
      bitcoinAddress: 'test'
    });
    isError(response, 400);
  });

  const changeEmailTest = 'change-email@test.com';

  it('should success, email only', async () => {
    const loginOpts = {
      email: 'newchangeemailtest@email.com',
      username: 'test-changeemailtest',
      password: 'MyPassword^007',
      repeatPassword: 'MyPassword^007'
    };

    await login(agent, loginOpts, apiModule);
    
    const response = await agent.patch('/api/v1/profile').send({
      email: changeEmailTest
    });

    const profileResponse = await agent.get('/api/v1/profile');
    console.log(profileResponse.body.result);
    assert.deepEqual(profileResponse.body.result.email, loginOpts.email);

    const dbResponse = await apiModule.dbConnection.sequelize.models['verification-tokens'].findOne({
      where: {userId: response.body.result.id, isActive: true}
    });

    const confirmResponse = await agent.get(`/api/v1/profile/change-email/${dbResponse['token']}`);
    isSuccess(confirmResponse);
    const profileResponseUpdated = await agent.get('/api/v1/profile');
    isSuccess(profileResponseUpdated);
    assert.deepEqual(profileResponseUpdated.body.result.email, changeEmailTest);
  });

  it('should forbid, email already used', async () => {
    const response = await agent.patch('/api/v1/profile').send({
      email: changeEmailTest
    });
    isError(response, 400);
  });

});

describe('POST /api/v1/profile/peerplays/create-account', () => {

  beforeEach(async () => {
    await login(agent, null, apiModule);
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/profile/peerplays/create-account').send({});
    isError(response, 401);
  });

  it('should forbid, invalid request', async () => {
    const response = await agent.post('/api/v1/profile/peerplays/create-account').send({});
    isError(response, 400);
  });

  it('should forbid, invalid key', async () => {
    const response = await agent.post('/api/v1/profile/peerplays/create-account').send({
      name: constants.modules.api.profile.validPeerplaysName,
      activeKey: constants.modules.api.profile.validPeerplaysKey,
      ownerKey: 'test'
    });
    isError(response, 400);
  });

  it('should forbid invalid accouname', async () => {
    const response = await agent.post('/api/v1/profile/peerplays/create-account').send({
      name: 'test',
      activeKey: constants.modules.api.profile.validPeerplaysKey,
      ownerKey: constants.modules.api.profile.validPeerplaysKey
    });
    isError(response, 400);
  });

  it('should success with valid data', async () => {
    const profileResponse = await agent.get('/api/v1/profile');
    const profile = profileResponse.body.result;
    const response = await agent.post('/api/v1/profile/peerplays/create-account').send({
      name: constants.modules.api.profile.validPeerplaysName,
      activeKey: constants.modules.api.profile.validPeerplaysKey,
      ownerKey: constants.modules.api.profile.validPeerplaysKey
    });
    isSuccess(response);
    profile.peerplaysAccountName = constants.modules.api.profile.validPeerplaysName;
    assert.deepEqual(response.body.result, profile);
  });

});

describe('POST /api/v1/profile/avatar', () => {

  const testImage = path.resolve(__dirname, 'files/test.png');
  const testPDF = path.resolve(__dirname, 'files/test.pdf');

  beforeEach(async () => {
    await login(agent, null, apiModule);
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/profile/avatar').send({});
    isError(response, 401);
  });

  it('should forbid without file', async () => {
    const response = await agent.post('/api/v1/profile/avatar').send({});
    isError(response, 400);
  });

  it('should forbid, invalid file', async () => {
    const response = await agent.post('/api/v1/profile/avatar').attach('file', testPDF);
    isError(response, 400);
  });

  it('should success if avatar not exists', async () => {
    const response = await agent.post('/api/v1/profile/avatar').attach('file', testImage);
    isSuccess(response, 200);
    const {result} = response.body;
    assert.isNotEmpty(result.avatar);
    assert.isString(result.avatar);
  });

});

describe('DELETE /api/v1/profile/avatar', () => {

  const testImage = path.resolve(__dirname, 'files/test.png');

  beforeEach(async () => {
    await login(agent, null, apiModule);
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.delete('/api/v1/profile/avatar');
    isError(response, 401);
  });

  it('should success delete uploaded avatar', async () => {
    await agent.post('/api/v1/profile/avatar').attach('file', testImage);
    const response = await agent.delete('/api/v1/profile/avatar');
    assert.isEmpty(response.body.result.avatar);
  });

  it('should success even if file does not exists', async () => {
    const response = await agent.delete('/api/v1/profile/avatar');
    assert.isEmpty(response.body.result.avatar);
  });

});

after(async () => {
  await apiModule.close();
});

