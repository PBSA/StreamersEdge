const { listModules } = require('awilix');
const { getLogger } = require('log4js');

const { container, initModule } = require('./awilix');

const logger = getLogger();
const currentModule = process.env.MODULE || 'api';

(async () => {
	try {
		const connections = listModules(['connections/*.js']);
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
 * @typedef {Object} RequestObject
 * @property {{body: Object, query: Object}} pure
 * @property {UserObject} user
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
 * @property {Boolean} cors
 * @property {Boolean} isDevelopment
 * @property {{host:String, port:String|Number, database:String, user:String, password:String}} db
 * @property {{username:String, password:String, url:String}} jira
 * @property {{level:String}} logger
 * @property {String} port
 * @property {String} adminPort
 * @property {{enabled:Boolean, config:String}} raven
 * @property {{service:String, user:String, pass:String}} mailer
 * @property {String} session_secret
 * @property {{frontend:String,backend:String}} urls
 * @property {{clientId:String,clientSecret:String}} instagram
 * @property {{stripeSecretKey:String,stripePlanId:String}} stripe
 * @property {String} encryptSalt
 */
