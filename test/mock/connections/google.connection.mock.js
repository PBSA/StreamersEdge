const constants = require('../../constants.json');

class GoogleConnectionMock {

	connect() {}

	async userInfo(auth, code) {
		if (code === constants.modules.api.auth.googleValidCode) {
			return {
				data: {
					id: constants.modules.api.auth.googleTestId,
					picture: constants.modules.api.auth.googleTestPicture,
					name: constants.modules.api.auth.googleTestUsername,
					email: constants.modules.api.auth.googleTestEmail,
				},
			};
		}
		throw new Error('Invalid code');
	}

	disconnect() {}

}

module.exports = GoogleConnectionMock;
