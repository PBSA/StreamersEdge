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

  async userInfo(auth, code) {
    code = code.replace(/^4%2F/, '4/');
    const {tokens} = await auth.getToken(code);
    auth.setCredentials(tokens);
    const oauth2 = google.oauth2({version: 'v1', auth});
    const profile = await oauth2.userinfo.get();
    profile.data.youtube = '';

    const youtubeService = google.youtube('v3');
    const youtubeProfile = await youtubeService.channels.list({
      auth: auth,
      part: 'snippet',
      mine: true
    });

    if (youtubeProfile.data.items.length === 1) {
      profile.data.youtube = `https://www.youtube.com/channel/${youtubeProfile.data.items[0].id}`;
    }

    return profile;
  }

  disconnect() {}

}

module.exports = GoogleConnection;
