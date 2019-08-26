const logger = require('log4js').getLogger('db.connection');
const Sequelize = require('sequelize');
const fs = require('fs');
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
      logging: true
    });
    logger.info('DB is connected');
    await this.initModels();
    return this.sequelize;
  }

  async initModels() {
    const models = {};
    await Promise.all(fs.readdirSync('src/db/models').map(async (file) => {
      const Model = require(`../db/models/${file}`);
      Model.init(this.sequelize);
      const name = file.replace(/\.model\.js/, '').toLowerCase()
        .split('.')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
      models[name] = Model;
    }));
    Object.keys(models).forEach((name) => {
      models[name].associate(models);
    });
    // await this.sequelize.sync();
  }

  /** @returns {Promise<void>} */
  disconnect() {
    return this.sequelize.close();
  }

  /**
   *
   * @return {null|Sequelize}
   */
  getConnection(){
    return this.sequelize;
  }

}

module.exports = DbConnection;
