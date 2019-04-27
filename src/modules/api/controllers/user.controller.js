const RestError = require('../../../errors/rest.error');

class UserController {

	/**
	 * @param {AuthValidator} opts.authValidator
	 * @param {UserValidator} opts.userValidator
	 * @param {UserService} opts.userService
	 */
	constructor(opts) {
		this.authValidator = opts.authValidator;
		this.userService = opts.userService;
		this.userValidator = opts.userValidator;
	}

	/**
	 * Array of routes processed by this controller
	 * @returns {*[]}
	 */
	getRoutes() {
		return [
			/**
			 * @api {get} /api/v1/user/:id Get user by id
			 * @apiName UserGet
			 * @apiGroup Profile
			 * @apiVersion 0.1.0
			 * @apiParam {String} id  User id
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
				'get', '/api/v1/user/:id',
				this.authValidator.loggedOnly,
				this.userValidator.getUser,
				this.getUser.bind(this),
			],
		];
	}

	async getUser(user, id) {
		try {
			return await this.userService.getUser(id);
		} catch (e) {
			throw new RestError(e.message, 404);
		}
	}

}

module.exports = UserController;
