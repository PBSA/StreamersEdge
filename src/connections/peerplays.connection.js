/* istanbul ignore file */
const request = require('request');

const BaseConnection = require('./abstracts/base.connection');

class PeerplaysConnection extends BaseConnection {

	/**
	 * @param {AppConfig} opts.config
	 */
	constructor(opts) {
		super();

		this.config = opts.config;
	}

	connect() {}

	async request(form) {
		const options = {
			method: 'POST',
			url: this.config.peerplaysFaucetURL,
			form,
		};

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

module.exports = PeerplaysConnection;
