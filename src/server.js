const { listModules } = require('awilix');
const { getLogger } = require('log4js');
const config = require('config');
const Raven = require('raven');

const logger = getLogger();

if (config.raven.enabled) {
	logger.info('Configure raven');
	Raven.config(config.raven.url).install((e, d) => {
		logger.error(d);
		process.exit(1);
	});
} else {
	logger.warn('Raven is disabled');
}

const { container, initModule } = require('./awilix');

const currentModule = process.env.MODULE || 'api';

(async () => {
	const ravenHelper = container.resolve('ravenHelper');
	try {
		await ravenHelper.init();
		const connections = listModules(['src/connections/*.js']);
		await Promise.all(connections.map(async ({ name }) => {
			try {
				await container.resolve(name.replace(/\.([a-z])/, (a) => a[1].toUpperCase())).connect();
			} catch (error) {
				logger.error(`${name} connect error`);
				logger.error(error);
				process.exit(1);
			}
		}));
		await initModule(`${currentModule}.module`);
	} catch (err) {
		logger.error('Start error');
		ravenHelper.error(err);
	} finally {
		logger.info(`${currentModule || 'server'} has been started`);
	}
})();


/**
 * @typedef {Object} MongooseDocument
 * @property {String} _id
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {function():Promise<void>} save
 * @property {function():Promise<void>} remove
 */

/**
 * @typedef {Object} MongooseCollection
 * @property {function():Promise<Object.<[[*]]>>} getIndexes
 * @property {function(name:String)} dropIndex
 */

/**
 * @typedef {Object} MongooseModel
 * @property {MongooseCollection} collection
 */

/**
 * @typedef {Object} AppConfig
 * @property {String} logLevel
 * @property {{host:String, port:String|Number, database:String, user:String, password:String}} db
 * @property {String} session_secret
 * @property {Boolean} cors
 * @property {Number} port
 * @property {{enabled: Boolean, url: String}} raven
 */
