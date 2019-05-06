const constants = require('../../constants.json');

class FacebookConnectionMock {

	connect() {}

	async userInfo(code) {
		if (code === constants.modules.api.auth.facebookValidCode) {
			return {
				name: constants.modules.api.auth.facebookTestUsername,
				email: constants.modules.api.auth.facebookTestEmail,
				picture:
					{
						data:
							{
								height: 50,
								is_silhouette: true,
								url: constants.modules.api.auth.facebookTestPicture,
								width: 50,
							},
					},
				id: constants.modules.api.auth.facebookTestId,
			};
		}
		throw new Error('Invalid code');
	}

	disconnect() {}

}

module.exports = FacebookConnectionMock;
