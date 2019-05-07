const constants = require('../../constants.json');

class TwitchConnectionMock {

	constructor() {
		this.tokenUrl = 'https://id.twitch.tv/oauth2/token';
		this.userUrl = 'https://api.twitch.tv/kraken/user';
	}

	connect() {}

	async request(method, url, form, auth) {
		switch (url) {
			case this.tokenUrl:
				if (form.code === constants.modules.api.auth.twitchValidCode) {
					return {
						access_token: constants.modules.api.auth.twitchValidAuth,
					};
				}
				throw new Error('Invalid code');
			case this.userUrl:
				if (auth === constants.modules.api.auth.twitchValidAuth) {
					return {
						_id: constants.modules.api.auth.twitchTestId,
						email: constants.modules.api.auth.twitchTestEmail,
						name: constants.modules.api.auth.twitchTestUsername,
						logo: constants.modules.api.auth.twitchTestPicture,
					};
				}
				throw new Error('Invalid code');
			default:
				throw new Error('Invalid request');
		}
	}

	disconnect() {}

}

module.exports = TwitchConnectionMock;
