/* eslint-disable no-undef,global-require */
process.env.NODE_ENV = 'test';
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');

const { isError } = require('../helpers/test.response.helper');
const ApiModule = require('../api.module.test');

chai.use(chaiHttp);
let agent;
let apiModule;

before(async () => {
	apiModule = await ApiModule();
	agent = request.agent(apiModule.app);
});


describe('Invalid request', () => {

	it('should forbid. method not exists', async () => {
		const response = await agent.post('/api/v1/method/not/exists').send({});
		isError(response, 405);
	});

});

after(async () => {
	await apiModule.close();
});
