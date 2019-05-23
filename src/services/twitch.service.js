const {URL,format} = require('url');
const merge = require('utils-merge');

const RestError = require('../errors/rest.error');

const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_SCOPE = 'user_read';

class TwitchService {

  /**
	 * @param {AppConfig} opts.config
	 * @param {TwitchRepository} opts.twitchRepository
	 */
  constructor(opts) {
    this.config = opts.config;
    this.twitchRepository = opts.twitchRepository;
  }

  async getAuthRedirectURL() {
    const twitchConfig = this.config.twitch;
    const params = {
      response_type: 'code',
      redirect_uri: twitchConfig.callbackUrl,
      scope: TWITCH_SCOPE,
      state: true,
      client_id: twitchConfig.clientId
    };

    const parsed = new URL(TWITCH_OAUTH_URL);
    merge(parsed.query, params);
    delete parsed.search;
    return format(parsed);
  }

  async getUserByCode(code) {
    let user;

    try {
      const result = await this.twitchRepository.getAccessToken(code);
      user = await this.twitchRepository.getUser(result.access_token);
    } catch (e) {
      throw new RestError(e.message, 400);
    }

    return user;
  }

}

module.exports = TwitchService;
