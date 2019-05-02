const RestError = require('../../../errors/rest.error');

/* eslint-disable max-len */
class GoogleController {

	/**
	 * @param {AuthValidator} opts.authValidator
	 * @param {GoogleService} opts.googleService
	 * @param {UserService} opts.userService
	 */
	constructor(opts) {
		this.authValidator = opts.authValidator;
		this.googleService = opts.googleService;
		this.userService = opts.userService;
	}

	/**
	 * Array of routes processed by this controller
	 * @returns {*[]}
	 */
	getRoutes() {
		return [
			/**
			 * @api {get} /api/v1/auth/google/redirect-url Get redirect url
			 * @apiName GetRedirectURL
			 * @apiDescription You should use this method for receiving urls for redirect.
			 * @apiGroup Auth
			 * @apiVersion 0.1.0
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *   "result": "https://id.twitch.tv/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost&scope=user_read&state=true&client_id=5uyyouelk9a2d5rt0i1uuvntel2mb5",
			 *   "status": 200
			 * }
			 */
			['get', '/api/v1/auth/google/redirect-url', this.getRedirectUrl.bind(this)],
			/**
			 * @api {post} /api/v1/auth/google/code Auth with twitch code
			 * @apiName AuthWithCode
			 * @apiDescription After getting a code from twitch (twitch returns user to the redirect url with code),
			 * you should send this code to backend for finishing authentication process
			 * @apiGroup Auth
			 * @apiVersion 0.1.0
			 * @apiExample {json} Request-Example:
			 * {
			 *   "code": "334442ikjds--s0dff"
			 * }
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *   "status": 200,
			 *   "result": {
			 *     "id": "5cc315041ec568398b99d7ca",
			 *     "username": "test",
			 *     "youtube": "",
			 *     "facebook": "",
			 *     "peerplaysAccountName": "",
			 *     "bitcoinAddress": ""
			 *   }
			 * }
			 */
			['post', '/api/v1/auth/google/code', this.authValidator.validateAuthCode, this.authWithCode.bind(this)],
		];
	}

	async getRedirectUrl() {
		return this.googleService.getAuthRedirectURL();
	}

	async authWithCode(user, code, req) {
		let twitchUser;
		try {
			twitchUser = await this.googleService.getUserByCode(code);
		} catch (e) {
			throw new RestError(e.message, 400);
		}
		const User = await this.userService.getUserByGoogleAccount(twitchUser);
		await new Promise((success) => req.login(User, () => success()));
		return this.userService.getCleanUser(User);
	}

}

module.exports = GoogleController;
