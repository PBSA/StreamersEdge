process.env.NODE_ENV = 'test';
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');
const {isSuccess, isError} = require('../helpers/test.response.helper');
const {login} = require('../helpers/test.login.helper');
const ApiModule = require('../api.module.test');

chai.use(chaiHttp);
let agent;
let apiModule;

before(async () => {
  apiModule = await ApiModule();
  agent = request.agent(apiModule.app);
});

describe('POST /api/v1/auth/logout', () => {

  const validObject = {
    email: 'testlogout@email.com',
    username: 'test-testlogout',
    password: 'My1Password^',
    repeatPassword: 'My1Password^'
  };

  beforeEach(async () => {
    await agent.post('/api/v1/auth/logout');
  });

  it('should forbid. only authorized user', async () => {
    const response = await agent.post('/api/v1/auth/logout');
    isError(response, 401);
  });

  it('should success. valid request', async () => {
    await login(agent, validObject, apiModule);
    const response = await agent.post('/api/v1/auth/logout');
    isSuccess(response);
  });

});

describe('POST /api/v1/auth/sign-up', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/logout');
  });

  const validObject = {
    email: 'test@email.com',
    username: 'test-username',
    password: 'My1Password^',
    repeatPassword: 'My1Password^'
  };

  it('should forbid. empty body', async () => {
    const response = await agent.post('/api/v1/auth/sign-up');
    isError(response, 400, ['email', 'username', 'password', 'repeatPassword']);
  });

  it('should forbid. email does not exist', async () => {
    const body = {...validObject};
    delete body.email;
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['email']);
  });

  it('should forbid. username does not exist', async () => {
    const body = {...validObject};
    delete body.username;
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['username']);
  });

  it('should forbid. password does not exist', async () => {
    const body = {...validObject};
    delete body.password;
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['password']);
  });

  it('should forbid. repeatPassword does not exist', async () => {
    const body = {...validObject};
    delete body.repeatPassword;
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['repeatPassword']);
  });

  it('should forbid. repeatPassword does not match to password', async () => {
    const body = {...validObject};
    body.repeatPassword = 'testetsttest';
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['repeatPassword']);
  });

  it('should forbid. invalid email', async () => {
    const body = {...validObject};
    body.email = 'testetsttest';
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['email']);
  });

  it('should forbid. deep email', async () => {
    const body = {...validObject};
    body.email = 'test@test.tet.dev.com';
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['email']);
  });

  it('should forbid. username has wrong letters', async () => {
    const body = {...validObject};
    body.username = 'MyWrongUserName';
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['username']);
  });

  it('should forbid. username has wrong symbols', async () => {
    const body = {...validObject};
    body.username = 'my__wrong&username';
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['username']);
  });

  it('should forbid. username has -dividend-distribution', async () => {
    const body = {...validObject};
    body.username = 'my-dividend-distribution';
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isError(response, 400, ['username']);
  });

  it('should success. valid request', async () => {
    const body = {...validObject};
    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    isSuccess(response);
  });

});

describe('GET /api/v1/auth/confirm-email/:token', () => {

  beforeEach(async () => {
    await agent.post('/api/v1/auth/logout');
  });

  const validObject = {
    email: 'test2@email.com',
    username: 'test-username-2',
    password: 'My1Password^',
    repeatPassword: 'My1Password^'
  };

  it('should forbid. invalid token', async () => {
    const response = await agent.get('/api/v1/auth/confirm-email/test');
    isError(response, 404);
  });

  it('should success. correct token', async () => {
    const body = {...validObject};

    const response = await agent.post('/api/v1/auth/sign-up').send(body);
    const {token} = await apiModule.dbConnection.sequelize.models['verification-tokens'].findOne({
      where: {userId: response.body.result.id}
    });
    const confirmResponse = await agent.get(`/api/v1/auth/confirm-email/${token}`);
    isSuccess(confirmResponse);
  });

});

describe('POST /api/v1/auth/sign-in', () => {

  const validObject = {
    email: 'test3@email.com',
    username: 'test-username-3',
    password: 'My1Password^',
    repeatPassword: 'My1Password^'
  };

  before(async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/auth/sign-up').send(validObject);
    const {token} = await apiModule.dbConnection.sequelize.models['verification-tokens'].findOne({
      where: {userId: response.body.result.id}
    });
    await agent.get(`/api/v1/auth/confirm-email/${token}`);
  });

  it('should forbid. inactive email', async () => {
    const body = {
      email: 'test4@email.com',
      username: 'test-username-4',
      password: 'My1Password^',
      repeatPassword: 'My1Password^'
    };
    await agent.post('/api/v1/auth/sign-up').send(body);

    const response = await agent.post('/api/v1/auth/sign-in').send({
      login: body.email,
      password: body.password
    });
    isError(response, 400);
  });

  it('should forbid. invalid login', async () => {
    const response = await agent.post('/api/v1/auth/sign-in').send({
      login: 'invalid-test-login',
      password: validObject.password
    });
    isError(response, 400);
  });

  it('should forbid. invalid password', async () => {
    const response = await agent.post('/api/v1/auth/sign-in').send({
      login: validObject.email,
      password: 'invalid-test-login'
    });
    isError(response, 400);
  });

  it('should success with email', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/auth/sign-in').send({
      login: validObject.email,
      password: validObject.password
    });
    isSuccess(response);
  });

  it('should success with username', async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/auth/sign-in').send({
      login: validObject.username,
      password: validObject.password
    });
    isSuccess(response);
  });

});

describe('POST /api/v1/auth/reset-password', () => {
  const validObject = {
    email: 'test5@email.com',
    username: 'test-username-5',
    password: 'My1Password^',
    repeatPassword: 'My1Password^'
  };

  const newPassword = 'MyNewPassword';

  let userId;

  before(async () => {
    await agent.post('/api/v1/auth/logout');
    const response = await agent.post('/api/v1/auth/sign-up').send(validObject);
    const {token} = await apiModule.dbConnection.sequelize.models['verification-tokens'].findOne({
      where: {userId: response.body.result.id}
    });
    userId = response.body.result.id;
    await agent.get(`/api/v1/auth/confirm-email/${token}`);
  });

  it('should success', async () => {
    await agent.post('/api/v1/auth/logout');

    await agent.post('/api/v1/auth/forgot-password').send({
      email: validObject.email
    });
    const {token} = await apiModule.dbConnection.sequelize.models['reset-tokens'].findOne({where: {userId}});

    const failResult = await agent.post('/api/v1/auth/sign-in').send({
      login: validObject.username,
      password: newPassword
    });

    isError(failResult, 400);

    await agent.post('/api/v1/auth/reset-password').send({
      token,
      password: newPassword,
      repeatPassword: newPassword
    });

    const successResult = await agent.post('/api/v1/auth/sign-in').send({
      login: validObject.username,
      password: newPassword
    });

    isSuccess(successResult);

  });
});

after(async () => {
  await apiModule.close();
});
