/* eslint-disable no-undef,global-require */
process.env.NODE_ENV = 'test';
const { assert } = require('chai');
const request = require('supertest');
const chai = require('chai');
chai.use(require('chai-url'));
const chaiHttp = require('chai-http');

const { isSuccess, isError } = require('../helpers/test.response.helper');
const ApiModule = require('../api.module.test');
const constants = require('../../../constants.json');

chai.use(chaiHttp);
let agent;
let apiModule;

before(async () => {
	apiModule = await ApiModule();
	agent = request.agent(apiModule.app);
});

describe('GET /api/v1/profile', () => {

	beforeEach(async () => {
		await agent.post('/api/v1/auth/logout');
	});

	it('should forbid, user not logged', async () => {
		const response = await agent.get('/api/v1/profile');
		isError(response, 401);
	});

	it('should success. User logged', async () => {
		await agent.post('/api/v1/auth/code').send({
			code: constants.modules.api.auth.twitchValidCode,
		});
		const response = await agent.get('/api/v1/profile');
		isSuccess(response);
		assert.deepEqual(response.body.result, {
			id: response.body.result.id,
			twitchUsername: constants.modules.api.auth.twitchTestUsername,
			youtube: '',
			facebook: '',
			peerplaysAccountName: '',
			bitcoinAddress: '',
		});
	});

});


describe('PATCH /api/v1/profile', () => {

	beforeEach(async () => {
		await agent.post('/api/v1/auth/code').send({ code: constants.modules.api.auth.twitchValidCode });
	});

	it('should forbid, user not logged', async () => {
		await agent.post('/api/v1/auth/logout');
		const response = await agent.patch('/api/v1/profile').send({});
		isError(response, 401);
	});

	it('should success, empty request', async () => {
		const response = await agent.patch('/api/v1/profile').send({});
		isSuccess(response);
	});

	it('should forbid, invalid data', async () => {
		const response = await agent.patch('/api/v1/profile').send({
			youtube: '-',
			facebook: '-',
			peerplaysAccountName: '-',
			bitcoinAddress: '-',
		});
		isError(response, 400);
	});

	it('should success, youtube only', async () => {
		const profileResponse = await agent.get('/api/v1/profile');
		const profile = profileResponse.body.result;
		const response = await agent.patch('/api/v1/profile').send({
			youtube: constants.modules.api.profile.youtubeLink,
		});
		isSuccess(response);
		profile.youtube = constants.modules.api.profile.youtubeLink;
		assert.deepEqual(response.body.result, profile);
	});

	it('should success, facebook only', async () => {
		const profileResponse = await agent.get('/api/v1/profile');
		const profile = profileResponse.body.result;
		const response = await agent.patch('/api/v1/profile').send({
			facebook: constants.modules.api.profile.facebookLink,
		});
		isSuccess(response);
		profile.facebook = constants.modules.api.profile.facebookLink;
		assert.deepEqual(response.body.result, profile);
	});

	it('should success, peerplays only', async () => {
		const profileResponse = await agent.get('/api/v1/profile');
		const profile = profileResponse.body.result;
		const response = await agent.patch('/api/v1/profile').send({
			peerplaysAccountName: constants.modules.api.profile.peerplaysAccount,
		});
		isSuccess(response);
		profile.peerplaysAccountName = constants.modules.api.profile.peerplaysAccount;
		assert.deepEqual(response.body.result, profile);
	});

	it('should success, bitcoin address only', async () => {
		const profileResponse = await agent.get('/api/v1/profile');
		const profile = profileResponse.body.result;
		const response = await agent.patch('/api/v1/profile').send({
			bitcoinAddress: constants.modules.api.profile.validBitcoinAddress,
		});
		isSuccess(response);
		profile.bitcoinAddress = constants.modules.api.profile.validBitcoinAddress;
		assert.deepEqual(response.body.result, profile);
	});

	it('should forbid, bitcoin address invalid', async () => {
		const response = await agent.patch('/api/v1/profile').send({
			bitcoinAddress: 'test',
		});
		isError(response, 400);
	});
});

after(async () => {
	await apiModule.close();
});
