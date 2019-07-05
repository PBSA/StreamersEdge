class AdminController {

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
       * @api {get} /api/v1/admin/profile Get authorized admin profile
       * @apiName AdminProfileGet
       * @apiDescription Get profile of authorized admin
       * @apiGroup Admin
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "status": 200,
       *   "result": {
       *     "id": "5cc315041ec568398b99d7ca",
       *     "username": "test",
       *     "email": "test@email.com",
       *     "twitchUserName": "",
       *     "googleName": "",
       *     "avatar": "",
       *     "youtube": "",
       *     "facebook": "",
       *     "peerplaysAccountName": "",
       *     "bitcoinAddress": "",
       *     "userType": "viewer"
       *   }
       * }
       */
      [
        'get', '/api/v1/admin/profile',
        this.authValidator.loggedAdminOnly,
        this.getProfile.bind(this)
      ]
    ];
  }

  async getProfile(user) {
    return this.userService.getCleanUser(user);
  }

}

module.exports = AdminController;
