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

  async getStreams(userIds) {
    const options = {
      method: 'GET',
      uri: `${this.config.twitchUrl}${streamConstants.gamedIds}${userIds.map((id) => `&user_id=${id}`)}`.replace(/,/g,''),
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
          success(JSON.parse(body).data);
        } catch (_err) {
          fail(_err.message);
        }
      });
    });
  }

  disconnect() {}

}

module.exports = TwitchStreamConnection;
