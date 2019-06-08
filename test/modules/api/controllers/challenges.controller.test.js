process.env.NODE_ENV = 'test';
const {assert} = require('chai');
const moment = require('moment');
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

  beforeEach(async () => {
    await agent.post('/api/v1/auth/twitch/code').send({code: constants.modules.api.auth.twitchValidCode});
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

  it('should forbid create invite challenge without users', async () => {
    const body = {...validRequest};
    body.accessRule = 'invite';
    const response = await agent.post('/api/v1/challenges').send(body);
    isError(response, 400);
    assert.hasAllKeys(response.body.error, ['invitedAccounts']);
  });

  it('should success create challenge', async () => {
    const body = {...validRequest};
    const response = await agent.post('/api/v1/challenges').send(body);
    isSuccess(response);
  });

  it('should success create challenge with invites', async () => {
    const body = {...validRequest};
    body.accessRule = 'invite';
    body.invitedAccounts = [1];
    const response = await agent.post('/api/v1/challenges').send(body);
    isSuccess(response);
  });

});

after(async () => {
  await apiModule.close();
});
