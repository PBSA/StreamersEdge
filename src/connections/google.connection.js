/* istanbul ignore file */
const {google} = require('googleapis');

const BaseConnection = require('./abstracts/base.connection');

class GoogleConnection extends BaseConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    super();

    this.config = opts.config;
  }

  connect() {}

  async userYoutubeInfo(tokens) {
    const auth = new google.auth.OAuth2(
      this.config.google.clientId,
      this.config.google.clientSecret,
      this.config.google.callbackUrl
    );
    auth.setCredentials(tokens);

    const youtubeService = google.youtube('v3');
    return youtubeService.channels.list({
      auth: auth,
      part: 'snippet,status',
      mine: true
    });
  }

  disconnect() {}

}

module.exports = GoogleConnection;
