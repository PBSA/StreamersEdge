/* eslint-disable no-undef,global-require */
process.env.NODE_ENV = 'test';
// const { assert } = require('chai');
const request = require('supertest');
const chai = require('chai');
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

describe('GET /api/v1/methodname', () => {

	it('should be error', async () => {
		const result = await agent.get('/api/v1/methodname');
		isError(result, 405);
	});

});

after(async () => {
	await apiModule.close();
});
