/* istanbul ignore file */
const graph = require('fbgraph');
const BaseConnection = require('./abstracts/base.connection');

class FacebookConnection extends BaseConnection {

	/**
	 * @param {AppConfig} opts.config
	 */
	constructor(opts) {
		super();

		this.config = opts.config;
	}

	connect() {}

	async userInfo(code) {
		return new Promise((success, fail) => {
			graph.authorize({
				client_id: this.config.facebook.clientId,
				redirect_uri: this.config.facebook.callbackUrl,
				client_secret: this.config.facebook.clientSecret,
				code,
			}, (err, facebookRes) => {
				if (err) {
					fail(err);
					return;
				}
				graph.setAccessToken(facebookRes.access_token);
				graph.get('me?locale=en_US&fields=name,email,picture', (subErr, res) => {
					if (subErr) {
						fail(subErr);
						return;
					}
					success(res);
				});
			});
		});
	}

	disconnect() {}

}

module.exports = FacebookConnection;
