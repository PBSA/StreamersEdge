/* eslint-disable global-require,import/no-extraneous-dependencies */
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

describe('REST API', () => {
	describe('base.controller', () => {
		require('./controllers/base.controller.test');
	});
	describe('auth.controller', () => {
		require('./controllers/auth.controller.test');
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
