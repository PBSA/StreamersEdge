const logger = require('log4js').getLogger('db.connection');
const mongoose = require('mongoose');

const BaseConnection = require('./abstracts/base.connection');

/**
 * A namespace.
 * @namespace connections
 * @class DbConnection
 */
class DbConnection extends BaseConnection {

	/** @param {{config:AppConfig}} opts */
	constructor(opts) {
		super();
		const {
			user, password, host, port, database,
		} = opts.config.db;
		this._url = `mongodb://${(user) ? (`${user}:${password}@`) : ''}${host}:${port}/${database}`;
		mongoose.Promise = global.Promise;
	}

	/** @returns {Promise<Mongoose.Connection>} */
	async connect() {
		logger.trace('Start connect to db');
		mongoose.set('useCreateIndex', true);
		const connection = await mongoose.connect(this._url, { useNewUrlParser: true });
		logger.info('DB is connected');
		return connection;
	}

	/** @returns {Promise<void>} */
	disconnect() {
		return mongoose.connection.close();
	}

}

module.exports = DbConnection;
