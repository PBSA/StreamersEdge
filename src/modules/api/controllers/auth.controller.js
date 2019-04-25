const url = require('url');
const merge = require('utils-merge');

const TWITCH_OAUTH_URL = 'https://id.twitch.tv/oauth2/authorize';
const TWITCH_SCOPE = 'user_read';

class AuthController {

	/**
	 * @param {AuthValidator} opts.authValidator
	 * @param {AppConfig} opts.config
	 */
	constructor(opts) {
		this.config = opts.config;
		this.authValidator = opts.authValidator;
	}

	/**
	 * Array of routes processed by this controller
	 * @returns {*[]}
	 */
	getRoutes() {
		return [
			['get', '/api/v1/auth/redirect-url', this.getRedirectUrl.bind(this)],
		];
	}

	/**
	 * @route GET /api/v1/auth/redirect-url
	 * @description Receive url string for redirection user to twirch auth page and receive
	 *              auth code for further processing
	 * @returns {Promise<string>}
	 */
	async getRedirectUrl() {
		const twitchConfig = this.config.twitch;
		const params = {
			response_type: 'code',
			redirect_uri: twitchConfig.callbackUrl,
			scope: TWITCH_SCOPE,
			state: true,
			client_id: twitchConfig.clientId,
		};

		const parsed = url.parse(TWITCH_OAUTH_URL, true);
		merge(parsed.query, params);
		delete parsed.search;
		return url.format(parsed);
	}

}

module.exports = AuthController;
