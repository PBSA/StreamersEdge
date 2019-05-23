const {google} = require('googleapis');

const DEFAULT_SCOPE = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

class GoogleRepository {

  /**
	 * @param {GoogleConnection} opts.googleConnection
	 * @param {AppConfig} opts.config
	 */
  constructor(opts) {
    this.googleConnection = opts.googleConnection;
    this.config = opts.config;
  }

  getAuth() {
    return new google.auth.OAuth2(
      this.config.google.clientId,
      this.config.google.clientSecret,
      this.config.google.callbackUrl,
    );
  }

  getAuthUrl() {
    const auth = this.getAuth();
    return auth.generateAuthUrl({
      access_type: 'offline',
      scope: DEFAULT_SCOPE
    });
  }

  async getProfileByCode(code) {
    const {data} = await this.googleConnection.userInfo(this.getAuth(), code);
    return {
      id: data.id,
      picture: data.picture,
      name: data.name,
      email: data.email
    };
  }

}

module.exports = GoogleRepository;
