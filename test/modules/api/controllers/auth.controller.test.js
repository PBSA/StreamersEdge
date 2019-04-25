/* eslint-disable no-undef,global-require */
process.env.NODE_ENV = 'test';
// const { assert } = require('chai');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');

const { isSuccess } = require('../helpers/test.response.helper');
const ApiModule = require('../api.module.test');

chai.use(chaiHttp);
let agent;
let apiModule;

before(async () => {
	apiModule = await ApiModule();
	agent = request.agent(apiModule.app);
});

describe('GET /api/v1/auth/redirect-url', () => {

	it('should receive valid url', async () => {
		const response = await agent.get('/api/v1/auth/redirect-url');
		isSuccess(response);
		chai.expect(response.body.result).to.have.pathname('/oauth2/authorize');
		chai.expect(response.body.result).to.have.protocol('https');
	});

});

after(async () => {
	await apiModule.close();
});
