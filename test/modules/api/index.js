/* eslint-disable global-require,import/no-extraneous-dependencies,node/no-unpublished-require */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const describe = global.describe;

describe('REST API', () => {
  describe('auth.controller', () => {
    require('./controllers/auth.controller.test');
  });
  describe('base.controller', () => {
    require('./controllers/base.controller.test');
  });
  describe('facebook.controller', () => {
    require('./controllers/facebook.controller.test');
  });
  describe('google.controller', () => {
    require('./controllers/google.controller.test');
  });
  describe('twitch.controller', () => {
    require('./controllers/twitch.controller.test');
  });
  describe('profile.controller', () => {
    require('./controllers/profile.controller.test');
  });
  describe('user.controller', () => {
    require('./controllers/user.controller.test');
  });
});
