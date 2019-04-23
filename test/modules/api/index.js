/* eslint-disable global-require,import/no-extraneous-dependencies */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('REST API', () => {
	describe('first.controller', () => {
		require('./controllers/first.controller.test');
	});
});
