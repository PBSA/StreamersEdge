/* eslint-disable global-require,import/no-extraneous-dependencies */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('REST API', () => {
	describe('auth.controller', () => {
		require('./controllers/auth.controller.test');
	});
});
