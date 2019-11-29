process.env.NODE_ENV = 'test';
const {assert} = require('chai');
const moment = require('moment');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');

const {isError, isSuccess} = require('../helpers/test.response.helper');
const ApiModule = require('../api.module.test');
const {login} = require('../helpers/test.login.helper');
const constants = require('../../../constants.json');


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
    timeToStart: moment().add(1, 'hour').toISOString(),
    game: 'pubg',
    conditionsText: '',
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
    const response = await agent.post('/api/v1/challenges').send(body);
    isError(response, 400);
    assert.hasAllKeys(response.body.error, ['conditions']);
  });

  //Not Requried for v1
  // it('should forbid create invite challenge without users', async () => {
  //   const body = {...validRequest};
  //   body.accessRule = 'invite';
  //   body.depositOp = firstTx;
  //   const response = await agent.post('/api/v1/challenges').send(body);
  //   isError(response, 400);
  //   assert.hasAllKeys(response.body.error, ['invitedAccounts']);
  // });

  it('should forbit, User is not gamer', async () => {
    await agent.post('/api/v1/notifications/subscribe').send(subscribe);
    const body = {...validRequest};
    const response = await agent.post('/api/v1/challenges').send(body);
    isError(response,400);
  });

  it('should success create challenge', async () => {
    await agent.post('/api/v1/notifications/subscribe').send(subscribe);
    const body = {...validRequest};
    const profileResponse = await agent.patch('/api/v1/profile').send({
      twitchId: constants.modules.api.profile.twitchId,
      steamId: constants.modules.api.profile.steamId
    });
    isSuccess(profileResponse);
    const response = await agent.post('/api/v1/challenges').send(body);
    isSuccess(response);
  });

  //Not Required for v1
  // it('should success create challenge with invites', async () => {
  //   const validObject = {
  //     email: 'test1@email.com',
  //     username: 'test1-username',
  //     password: 'My1Password^',
  //     repeatPassword: 'My1Password^'
  //   };
  //   const bodyUser = {...validObject};
  //   const user = await agent.post('/api/v1/auth/sign-up').send(bodyUser);
  //   await agent.post('/api/v1/notifications/subscribe').send(subscribe);
  //   const body = {...validRequest};
  //   body.accessRule = 'invite';
  //   body.depositOp = secondTx;
  //   body.invitedAccounts = [user.body.result.id];
  //   const response = await agent.post('/api/v1/challenges').send(body);
  //   isSuccess(response);
  // });

});

after(async () => {
  await apiModule.close();
});
