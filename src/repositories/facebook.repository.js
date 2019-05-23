const graph = require('fbgraph');

class FacebookRepository {

  /**
	 * @param {FacebookConnection} opts.facebookConnection
	 * @param {AppConfig} opts.config
	 */
  constructor(opts) {
    this.facebookConnection = opts.facebookConnection;
    this.config = opts.config;
  }

  getAuthUrl() {
    return graph.getOauthUrl({
      client_id: this.config.facebook.clientId,
      redirect_uri: this.config.facebook.callbackUrl,
      scope: 'email'
    });
  }

  async getProfileByCode(code) {
    const data = await this.facebookConnection.userInfo(code);
    let picture = null;

    if (data.picture.data && data.picture.data.url) {
      picture = data.picture.data.url;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      picture
    };
  }

}

module.exports = FacebookRepository;
