/* eslint-disable global-require,no-undef,import/no-dynamic-require */
const fs = require('fs');

const { listModules } = require('awilix');
const { getLogger } = require('log4js');
// const { assert } = require('chai');
const { container } = require('./../src/awilix');

describe('ALL TESTS', () => {
	if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'local-test') {
		console.error('Invalid NODE_ENV. Require NODE_ENV=test');
		process.exit(1);
	}

	const logger = getLogger();

	describe('global', () => {

		it('init connections', async () => {
			const connections = listModules(['src/connections/*.js']);
			await Promise.all(connections.map(({ name }) => new Promise(async (resolve) => {
				try {
					await container.resolve(name.replace(/\.([a-z])/, (a) => a[1].toUpperCase())).connect();
					resolve();
				} catch (error) {
					logger.error(`${name} connect error`);
					logger.error(error);
					process.exit(1);
				}
			})));
		});

		it('clear database', async () => {
			await Promise.all(fs.readdirSync('./src/models').map(async (file) => {
				const Model = require(`../src/models/${file}`);
				await Model.deleteMany({});
			}));
		});
	});

	require('./modules/');

	after(async () => {
		const connections = listModules(['src/connections/*.js']);
		await Promise.all(connections.map(({ name }) => new Promise(async (resolve) => {
			try {
				await container.resolve(name.replace(/\.([a-z])/, (a) => a[1].toUpperCase())).disconnect();
				resolve();
			} catch (error) {
				logger.error(`${name} disconnect error`);
				logger.error(error);
				process.exit(1);
			}
		})));
	});
});
