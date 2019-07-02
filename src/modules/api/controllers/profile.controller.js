const RestError = require('../../../errors/rest.error');

class ProfileController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {ProfileValidator} opts.profileValidator
   * @param {UserService} opts.userService
   * @param {FileService} opts.fileService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.profileValidator = opts.profileValidator;
    this.userService = opts.userService;
    this.fileService = opts.fileService;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes() {
    return [
      /**
       * @apiDefine AccountObjectResponse
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "status": 200,
       *   "result": {
       *     "id": 7,
       *     "username": "test",
       *     "email": "test@email.com",
       *     "twitchUserName": "",
       *     "googleName": "",
       *     "youtube": "",
       *     "facebook": "",
       *     "twitch": "",
       *     "peerplaysAccountName": "",
       *     "bitcoinAddress": "",
       *     "userType": "viewer",
       *     "avatar": ""
       *  }
       * }
       */

      /**
       * @api {get} /api/v1/profile Get authorized user profile
       * @apiName ProfileGet
       * @apiDescription Get profile of authorized user
       * @apiGroup Profile
       * @apiVersion 0.1.0
       * @apiUse AccountObjectResponse
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
       *   "avatar": "",
       *   "youtube": "",
       *   "facebook": "",
       *   "peerplaysAccountName": "",
       *   "bitcoinAddress": "",
       *   "userType": "viewer"
       * }
       * @apiUse AccountObjectResponse
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
       * @apiUse AccountObjectResponse
       */
      [
        'post', '/api/v1/profile/peerplays/create-account',
        this.authValidator.loggedOnly,
        this.profileValidator.createPeerplaysAccount,
        this.createPeerplaysAccount.bind(this)
      ],
      /**
       * @api {post} /api/v1/profile/avatar Add or change account avatar
       * @apiName ProfileUploadAvatar
       * @apiGroup Profile
       * @apiVersion 0.1.0
       * @apiExample {form-data} Request-Example:
       * "file": ...file...
       * @apiUse AccountObjectResponse
       */
      [
        'post', '/api/v1/profile/avatar',
        this.authValidator.loggedOnly,
        this.uploadAvatar.bind(this)
      ],
      /**
       * @api {delete} /api/v1/profile/avatar Delete profile avatar
       * @apiName ProfileDeleteAvatar
       * @apiGroup Profile
       * @apiVersion 0.1.0
       * @apiUse AccountObjectResponse
       */
      [
        'delete', '/api/v1/profile/avatar',
        this.authValidator.loggedOnly,
        this.deleteAvatar.bind(this)
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

  async uploadAvatar(user, data, req, res) {
    const location = await this.fileService.saveImage(req, res);
    user = await this.userService.updateAvatar(user, location);
    return this.userService.getCleanUser(user);
  }

  async deleteAvatar(user) {
    user = await this.userService.updateAvatar(user, null);
    return this.userService.getCleanUser(user);
  }

}

module.exports = ProfileController;
