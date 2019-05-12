/* eslint-disable no-undef,global-require,node/no-unpublished-require */
process.env.NODE_ENV = 'test';
const {assert} = require('chai');
const request = require('supertest');
const chai = require('chai');
const path = require('path');
const fs = require('fs');
const config = require('config');
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

describe('GET /api/v1/profile', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/logout');
  });

  it('should forbid, user not logged', async () => {
    const response = await agent.get('/api/v1/profile');
    isError(response, 401);
  });

  it('should success. User logged', async () => {
    await agent.post('/api/v1/auth/twitch/code').send({
      code: constants.modules.api.auth.twitchValidCode
    });
    const response = await agent.get('/api/v1/profile');
    isSuccess(response);
    assert.deepEqual(response.body.result, {
      id: response.body.result.id,
      username: constants.modules.api.auth.twitchTestUsername,
      youtube: '',
      facebook: '',
      peerplaysAccountName: '',
      bitcoinAddress: '',
      avatar: constants.modules.api.auth.twitchTestPicture
    });
  });

});

describe('PATCH /api/v1/profile', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/twitch/code').send({code: constants.modules.api.auth.twitchValidCode});
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

});

describe('POST /api/v1/profile/peerplays/create-account', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/twitch/code').send({code: constants.modules.api.auth.twitchValidCode});
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
    await agent.post('/api/v1/auth/twitch/code').send({code: constants.modules.api.auth.twitchValidCode});
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
    isSuccess(response);
    const {result} = response.body;
    assert.match(
      result.avatar,
      new RegExp(`${config.urls.backend}/api/images/avatar/\\d+x\\d+/[A-z0-9]+-[A-z0-9]+-[A-z0-9]+.png`),
    );
    const image = await agent.get(result.avatar.replace(new RegExp(config.urls.backend), ''));
    image.should.have.status(200);
  });

});

describe('DELETE /api/v1/profile/avatar', () => {

  const testImage = path.resolve(__dirname, 'files/test.png');

  beforeEach(async () => {
    await agent.post('/api/v1/auth/twitch/code').send({code: constants.modules.api.auth.twitchValidCode});
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.delete('/api/v1/profile/avatar');
    isError(response, 401);
  });

  it('should success delete twitch avatar', async () => {
    const response = await agent.delete('/api/v1/profile/avatar');
    assert.isNull(response.body.result.avatar);
  });

  it('should success delete uploaded avatar', async () => {
    await agent.post('/api/v1/profile/avatar').attach('file', testImage);
    const response = await agent.delete('/api/v1/profile/avatar');
    assert.isNull(response.body.result.avatar);
  });

  it('should success even if file does not exists', async () => {
    const {body} = await agent.post('/api/v1/profile/avatar').attach('file', testImage);
    const {avatar} = body.result;
    const avatarFilename = avatar.match(/[A-z0-9]+-[A-z0-9]+-[A-z0-9]+\.png/)[0];
    const file = path.resolve(config.basePath, 'public/images/avatar/original/', avatarFilename);
    fs.unlinkSync(file);
    const response = await agent.delete('/api/v1/profile/avatar');
    assert.isNull(response.body.result.avatar);
  });

});

after(async () => {
  await apiModule.close();
});
