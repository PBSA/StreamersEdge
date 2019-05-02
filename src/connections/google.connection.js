/* istanbul ignore file */
const { google } = require('googleapis');

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
		const { tokens } = await auth.getToken(code);
		auth.setCredentials(tokens);
		const oauth2 = google.oauth2({ version: 'v1', auth });
		return oauth2.userinfo.get();
	}

	disconnect() {}

}

module.exports = GoogleConnection;
