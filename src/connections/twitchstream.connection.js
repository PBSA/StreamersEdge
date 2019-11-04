const request = require('request');
const streamConstants = require('../constants/stream');
const BaseConnection = require('./abstracts/base.connection');

class TwitchStreamConnection extends BaseConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    super();

    this.config = opts.config;
  }

  connect() {}

  async request(userIds) {
    const options = {
      method: 'GET',
      uri: `${this.config.twitchUrl}${streamConstants.gamedIds}&userId=${userIds}`,
      headers: {'Client-ID': this.config.twitch.clientId}
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

module.exports = TwitchStreamConnection;
