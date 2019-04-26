/* istanbul ignore file */
const request = require('request');

const BaseConnection = require('./abstracts/base.connection');

class TwitchConnection extends BaseConnection {

	/**
	 * @param {AppConfig} opts.config
	 */
	constructor(opts) {
		super();

		this.config = opts.config;
	}

	connect() {}

	async request(method, url, form, auth) {
		const options = {
			method,
			url,
			form,
			headers: {
				'Client-ID': this.config.twitch.clientId,
				Accept: 'application/vnd.twitchtv.v5+json',
				'Content-Type': 'application/json',
				Authorization: auth || '',
			},
		};

		if (options.headers.Authorization !== '' && options.headers.Authorization.indexOf('OAuth') === -1) {
			options.headers.Authorization = `OAuth ${auth}`;
		}

		return new Promise((success, fail) => {
			request(options, (err, res, body) => {
				if (err) {
					fail(err);
					return;
				}
				if (res.statusCode !== 200) {
					fail(JSON.parse(body));
					return;
				}
				try {
					if (body.length === 0) {
						success(null);
						return;
					}
					success(JSON.parse(body));
				} catch (_err) {
					_err.statusCode = res.statusCode;
					fail(_err);
				}
			});
		});
	}

	disconnect() {}

}

module.exports = TwitchConnection;
