process.env.NODE_ENV = 'test';
const {assert} = require('chai');
const moment = require('moment');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');

const {isSuccess, isError} = require('../helpers/test.response.helper');
const ApiModule = require('../api.module.test');
const {login} = require('../helpers/test.login.helper');
const {firstTx, secondTx} = require('../helpers/test.transaction.helper');


chai.use(chaiHttp);
let agent;
let apiModule;

before(async () => {
  apiModule = await ApiModule();
  agent = request.agent(apiModule.app);
});

describe('POST /api/v1/challenges', () => {

  const validRequest = {
    name: 'Test name',
    startDate: moment().add(1, 'hour').toISOString(),
    endDate: moment().add(3, 'hour').toISOString(),
    game: 'pubg',
    accessRule: 'anyone',
    ppyAmount: 100,
    conditionsText: '',
    invitedAccounts: [],
    conditions: [{
      param: 'resultPlace',
      operator: '>',
      value: 1,
      join: 'END'
    }]
  };

  const subscribe = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/cw6aOnAet50:APA91bHi',
    expirationTime: null,
    keys: {
      p256dh: 'BEKDvqrxzRWlnHv272vmoRikeYUyeDvvwGzwhKD_',
      auth: 'Pamms0H_wkQI6LAn2eEQBQ'
    }
  };

  beforeEach(async () => {
    //await agent.post('/api/v1/auth/twitch/code').send({code: constants.modules.api.auth.twitchValidCode});
    await login(agent, null, apiModule);
  });

  it('should forbid, user not logged', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/challenges');
    isError(response, 401);
  });

  it('should forbid, empty object', async () => {
    const response = await agent.post('/api/v1/challenges');
    isError(response, 400);
  });

  it('should forbid, empty conditions and conditionsText', async () => {
    const body = {...validRequest};
    body.conditions = [];
    body.conditionsText = '';
    body.depositOp = firstTx;
    const response = await agent.post('/api/v1/challenges').send(body);
    isError(response, 400);
    assert.hasAllKeys(response.body.error, ['conditions']);
  });

  it('should forbid create invite challenge without users', async () => {
    const body = {...validRequest};
    body.accessRule = 'invite';
    body.depositOp = firstTx;
    const response = await agent.post('/api/v1/challenges').send(body);
    isError(response, 400);
    assert.hasAllKeys(response.body.error, ['invitedAccounts']);
  });

  let challengeId;

  it('should success create challenge', async () => {
    await agent.post('/api/v1/notifications/subscribe').send(subscribe);
    const body = {...validRequest};
    body.depositOp = firstTx;
    const response = await agent.post('/api/v1/challenges').send(body);
    isSuccess(response);
    challengeId = response.body.result.id;
  });

  it('should success create challenge (no depositOp)', async () => {
    await agent.post('/api/v1/notifications/subscribe').send(subscribe);
    const body = {...validRequest};
    body.depositOp = undefined;
    const response = await agent.post('/api/v1/challenges').send(body);
    isSuccess(response);
  });

  it('should success create challenge with invites', async () => {
    const validObject = {
      email: 'test1@email.com',
      username: 'test1-username',
      password: 'My1Password^',
      repeatPassword: 'My1Password^'
    };
    const bodyUser = {...validObject};
    const user = await agent.post('/api/v1/auth/sign-up').send(bodyUser);
    await agent.post('/api/v1/notifications/subscribe').send(subscribe);
    const body = {...validRequest};
    body.accessRule = 'invite';
    body.depositOp = secondTx;
    body.invitedAccounts = [user.body.result.id];
    const response = await agent.post('/api/v1/challenges').send(body);
    isSuccess(response);
  });

  it('should join challenge', async () => {
    const response = await agent.post('/api/v1/challenges/join').send({challengeId});
    isSuccess(response);
    const {body: {result}} = response;
    assert(result.challengeId === challengeId);
    assert.hasAllKeys(result, ['joinedAt', 'id', 'challengeId', 'userId', 'createdAt', 'updatedAt', 'isPayed']);
  });

});

after(async () => {
  await apiModule.close();
});
