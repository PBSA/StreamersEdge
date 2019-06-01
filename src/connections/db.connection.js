const logger = require('log4js').getLogger('db.connection');
const Sequelize = require('sequelize');
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
      user, password, host, port, database
    } = opts.config.db;
    this._url = `postgres://${(user) ? (`${user}:${password}@`) : ''}${host}:${port}/${database}`;
    this.sequelize = null;
  }

  /** @returns {Promise<*>} */
  async connect() {
    logger.trace('Start connect to db');

    this.sequelize = new Sequelize(this._url, {
      logging: false
    });
    logger.info('DB is connected');
    return this.sequelize;
  }

  /** @returns {Promise<void>} */
  disconnect() {
    return this.sequelize.close();
  }

}

module.exports = DbConnection;
