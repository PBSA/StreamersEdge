const RestError = require('../../../errors/rest.error');

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
			 *     "username": "test",
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
        this.getProfile.bind(this)
      ],
      /**
       * @api {patch} /api/v1/profile Update authorized user profile
       * @apiName ProfilePatch
       * @apiGroup Profile
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
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
       *     "username": "test",
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
        this.patchProfile.bind(this)
      ],
      /**
       * @api {post} /api/v1/profile/peerplays/create-account Create peerplays account for authorized user
       * @apiName ProfileCreatePPAccount
       * @apiGroup Profile
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "name": "testaccount",
       *   "activeKey": "PPY5iePa6MU4QHGyY5tk1XjngDG1j9jRWLspXxLKUqxSc4sh51ZS4",
       *   "ownerKey": "PPY5iePa6MU4QHGyY5tk1XjngDG1j9jRWLspXxLKUqxSc4sh51ZS4",
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
       *     "peerplaysAccountName": "testaccount",
       *     "bitcoinAddress": ""
       *  }
       * }
       */
      [
        'post', '/api/v1/profile/peerplays/create-account',
        this.authValidator.loggedOnly,
        this.profileValidator.createPeerplaysAccount,
        this.createPeerplaysAccount.bind(this)
      ]
    ];
  }

  async getProfile(user) {
    return this.userService.getCleanUser(user);
  }

  async patchProfile(user, updateData) {
    return this.userService.patchProfile(user, updateData);
  }

  async createPeerplaysAccount(user, data) {
    try {
      return await this.userService.createPeerplaysAccount(user, data);
    } catch (e) {
      throw new RestError(e.message, 400, e.details);
    }
  }

}

module.exports = ProfileController;
