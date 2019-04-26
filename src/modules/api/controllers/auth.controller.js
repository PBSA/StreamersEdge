/* eslint-disable max-len */
class AuthController {

	/**
	 * @param {AuthValidator} opts.authValidator
	 * @param {TwitchService} opts.twitchService
	 * @param {UserService} opts.userService
	 */
	constructor(opts) {
		this.authValidator = opts.authValidator;
		this.twitchService = opts.twitchService;
		this.userService = opts.userService;
	}

	/**
	 * Array of routes processed by this controller
	 * @returns {*[]}
	 */
	getRoutes() {
		return [
			/**
			 * @api {get} /api/v1/auth/redirect-url Get redirect url
			 * @apiName GetRedirectURL
			 * @apiDescription You should use this method for receiving urls for redirect.
			 * @apiGroup Auth
			 * @apiVersion 0.1.0
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *  "result": "https://id.twitch.tv/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Flocalhost&scope=user_read&state=true&client_id=5uyyouelk9a2d5rt0i1uuvntel2mb5",
			 *  "status": 200
			 * }
			 */
			['get', '/api/v1/auth/redirect-url', this.getRedirectUrl.bind(this)],
			/**
			 * @api {post} /api/v1/auth/code Auth with twitch code
			 * @apiName AuthWithCode
			 * @apiDescription After getting a code from twitch (twitch returns user to the redirect url with code),
			 * you should send this code to backend for finishing authentication process
			 * @apiGroup Auth
			 * @apiVersion 0.1.0
			 * @apiParamExample {json} Request-Example:
			 * {
			 *  "code": "334442ikjds--s0dff"
			 * }
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *  "status": 200,
			 *  "result": {
			 *    "id": "5cc315041ec568398b99d7ca",
			 *    "twitchUsername": "test",
			 *    "youtube": "",
			 *    "facebook": "",
			 *    "peerplaysAccountName": "",
			 *    "bitcoinAddress": ""
			 *  }
			 * }
			 */
			['post', '/api/v1/auth/code', this.authValidator.validateAuthCode, this.authWithCode.bind(this)],

			/**
			 * @api {post} /api/v1/auth/logout Logout
			 * @apiName AuthLogout
			 *
			 * @apiGroup Auth
			 * @apiVersion 0.1.0
			 * @apiParamExample {json} Request-Example:
			 * {}
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *  "status": 200,
			 *  "result": true
			 * }
			 */
			['post', '/api/v1/auth/logout', this.authValidator.loggedOnly, this.logout.bind(this)],
		];
	}

	/**
	 * @route GET /api/v1/auth/redirect-url
	 * @description Receive url string for redirection user to twirch auth page and receive
	 *              auth code for further processing
	 * @returns {Promise<string>}
	 */
	async getRedirectUrl() {
		return this.twitchService.getAuthRedirectURL();
	}

	async authWithCode(user, code, req) {
		const twitchUser = await this.twitchService.getUserByCode(code);
		const User = await this.userService.getUserByTwitchAccount(twitchUser);
		await new Promise((success) => req.login(User, () => success()));
		return this.userService.getCleanUser(User);
	}

	async logout(user, data, req) {
		req.logout();
		return true;
	}

}

module.exports = AuthController;
