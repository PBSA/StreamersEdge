const { listModules } = require('awilix');
const { getLogger } = require('log4js');

const { container, initModule } = require('./awilix');

const logger = getLogger();
const currentModule = process.env.MODULE || 'api';

(async () => {
	try {
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
		logger.warn('Start error');
		logger.warn(err);
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
 */
