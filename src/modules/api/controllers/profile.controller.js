class ProfileController {

	/**
	 * @param {AuthValidator} opts.authValidator
	 * @param {ProfileValidator} opts.profileValidator
	 * @param {UserService} opts.userService
	 */
	constructor(opts) {
		this.authValidator = opts.authValidator;
		this.profileValidator = opts.profileValidator;
		this.userService = opts.userService;
	}

	/**
	 * Array of routes processed by this controller
	 * @returns {*[]}
	 */
	getRoutes() {
		return [
			/**
			 * @api {get} /api/v1/profile Get authorized user profile
			 * @apiName ProfileGet
			 * @apiDescription Get profile of authorized user
			 * @apiGroup Profile
			 * @apiVersion 0.1.0
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *   "status": 200,
			 *   "result": {
			 *     "id": "5cc315041ec568398b99d7ca",
			 *     "twitchUsername": "test",
			 *     "youtube": "",
			 *     "facebook": "",
			 *     "peerplaysAccountName": "",
			 *     "bitcoinAddress": ""
			 *   }
			 * }
			 */
			[
				'get', '/api/v1/profile',
				this.authValidator.loggedOnly,
				this.getProfile.bind(this),
			],
			/**
			 * @api {patch} /api/v1/profile Update authorized user profile
			 * @apiName ProfilePatch
			 * @apiGroup Profile
			 * @apiVersion 0.1.0
			 * @apiParamExample {json} Request-Example:
			 * {
			 *   "youtube": "",
			 *   "facebook": "",
			 *   "peerplaysAccountName": "",
			 *   "bitcoinAddress": ""
			 * }
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *   "status": 200,
			 *   "result": {
			 *     "id": "5cc315041ec568398b99d7ca",
			 *     "twitchUsername": "test",
			 *     "youtube": "",
			 *     "facebook": "",
			 *     "peerplaysAccountName": "",
			 *     "bitcoinAddress": ""
			 *  }
			 * }
			 */
			[
				'patch', '/api/v1/profile',
				this.authValidator.loggedOnly,
				this.profileValidator.patchProfile,
				this.patchProfile.bind(this),
			],
		];
	}

	async getProfile(user) {
		return this.userService.getCleanUser(user);
	}

	async patchProfile(user, updateData) {
		return this.userService.patchProfile(user, updateData);
	}

}

module.exports = ProfileController;
