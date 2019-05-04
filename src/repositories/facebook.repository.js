class FacebookRepository {

	/**
	 * @param {TwitchConnection} opts.twitchConnection
	 * @param {AppConfig} opts.config
	 */
	constructor(opts) {
		this.tokenUrl = 'https://id.twitch.tv/oauth2/token';
		this.userUrl = 'https://api.twitch.tv/kraken/user';

		this.twitchConnection = opts.twitchConnection;
		this.config = opts.config;
		// this.getAccessToken()
	}

	async getAccessToken(code) {
		return this.twitchConnection.request(
			'POST',
			this.tokenUrl,
			{
				client_id: this.config.twitch.clientId,
				client_secret: this.config.twitch.clientSecret,
				grant_type: 'authorization_code',
				redirect_uri: this.config.twitch.callbackUrl,
				code,
				state: true,
			},
		);
	}

	async getUser(accessToken) {
		return this.twitchConnection.request(
			'GET',
			this.userUrl,
			{},
			accessToken,
		);
	}

}

module.exports = FacebookRepository;
