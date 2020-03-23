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
    this.apiInstance = null;

    const urls = this.config.peerplays.peerplaysWS.split(',');
    this.wsConnectionManager = new ConnectionManager({urls});
  }

  apiStatusCallback(apiInstance, status) {
    if (apiInstance !== this.apiInstance) {
      return;
    }

    switch (status) {
      case 'closed':
      case 'error':
        logger.error('peerplays connection failed, trying to reconnect');
        this.connect();
        break;
      default:
        break;
    }
  }

  async connectToPeerplays(endpoint) {
    logger.info(`connecting to peerplays endpoint "${endpoint}"`);
    const apiInstance = Apis.instance(endpoint, true);
    apiInstance.setRpcConnectionStatusCallback((status) => this.apiStatusCallback(apiInstance, status));
    await apiInstance.init_promise;
    this.apiInstance = apiInstance;
    logger.info('peerplays connection successful');
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
      try {
        await this.connectToPeerplays(this.endpoints[nextUrlIndex]);
        break;
      } catch (err) {
        logger.info(`peerplays connection failed, reason: ${err.message}`);
        nextUrlIndex++;
      }
    }

    if (nextUrlIndex >= this.endpoints.length) {
      throw new Error('failed to connect to peerplays endpoint');
    }

    this.dbAPI = this.apiInstance.db_api();
    this.networkAPI = this.apiInstance.network_api();
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
          fail('Peerplays: Unknown error');
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
