/* istanbul ignore file */
const request = require('request');
const {Apis, PrivateKey} = require('peerplaysjs-lib');

const BaseConnection = require('./abstracts/base.connection');

class PeerplaysConnection extends BaseConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    super();

    this.config = opts.config;
    this.dbAPI = null;

    this.privateKey = PrivateKey.fromWif(this.config.peerplays.paymentAccountWIF);
  }

  async connect() {
    await Apis.instance(this.config.peerplays.peerplaysWS, true).init_promise;
    this.dbAPI = Apis.instance().db_api();
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

  disconnect() {}

}

module.exports = PeerplaysConnection;
