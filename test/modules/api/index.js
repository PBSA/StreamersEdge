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
  describe('profile.controller', () => {
    require('./controllers/profile.controller.test');
  });
  describe('user.controller', () => {
    require('./controllers/user.controller.test');
  });
  describe('payment.controller', () => {
    require('./controllers/payment.controller.test');
  });
});
