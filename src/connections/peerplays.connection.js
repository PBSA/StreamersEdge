/* istanbul ignore file */
const request = require('request');
const {
  Apis,
  ConnectionManager,
  TransactionBuilder
} = require('peerplaysjs-lib');
const {getLogger} = require('log4js');
const logger = getLogger();

const BaseConnection = require('./abstracts/base.connection');

class PeerplaysConnection extends BaseConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    super();

    this.config = opts.config;
    this.dbAPI = null;
    this.asset = null;

    const urls = this.config.peerplays.peerplaysWS.split(',');
    this.wsConnectionManager = new ConnectionManager({urls});
  }

  async connect() {
    if (!this.endpoints) {
      this.endpoints = await this.wsConnectionManager.sortNodesByLatency();
    }

    if (!this.endpoints || this.endpoints.length === 0) {
      throw new Error('no valid peerplays urls');
    }

    let nextUrlIndex = 0;

    while (nextUrlIndex < this.endpoints.length) {
      const endpoint = this.endpoints[nextUrlIndex];
      logger.info(`connecting to peerplays endpoint "${endpoint}"`);

      try {
        await Apis.instance(endpoint, true).init_promise;
      } catch (err) {
        logger.info('peerplays connection failed, trying next endpoint');
        nextUrlIndex++;
        continue;
      }

      break;
    }

    logger.info('peerplays connection successful');

    this.dbAPI = Apis.instance().db_api();
    this.networkAPI = Apis.instance().network_api();
    [this.asset] = await this.dbAPI.exec('get_assets', [[this.config.peerplays.sendAssetId]]);
    this.TransactionBuilder = TransactionBuilder;
  }

  async request(form) {
    const options = {
      method: 'POST',
      uri: this.config.peerplays.peerplaysFaucetURL,
      json: form
    };

    return new Promise((success, fail) => {
      request(options, (err, res, body) => {

        if (err) {
          fail(err.message);
          return;
        }

        if (res.statusCode !== 200) {
          fail('Unknown error');
          return;
        }

        if (body.error) {
          fail(body.error);
          return;
        }

        if (body.length === 0) {
          success(null);
          return;
        }

        try {
          success(body);
        } catch (_err) {
          fail(_err.message);
        }
      });
    });
  }

  disconnect() {
  }

}

module.exports = PeerplaysConnection;
