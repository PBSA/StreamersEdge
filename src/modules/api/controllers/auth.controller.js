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
			['get', '/api/v1/auth/redirect-url', this.getRedirectUrl.bind(this)],
			['post', '/api/v1/auth/code', this.authValidator.validateAuthCode, this.authWithCode.bind(this)],
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
