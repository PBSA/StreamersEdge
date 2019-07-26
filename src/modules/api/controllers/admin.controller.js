class AdminController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {ProfileValidator} opts.profileValidator
   * @param {UserValidator} opts.userValidator
   * @param {AdminService} opts.adminService
   * @param {UserService} opts.userService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.profileValidator = opts.profileValidator;
    this.userValidator = opts.userValidator;
    this.userService = opts.userService;
    this.adminService = opts.adminService;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes() {
    return [
      /**
       * @swagger
       *
       * /admin/profile:
       *  get:
       *    description: Get profile of authorized admin
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    responses:
       *      200:
       *        description: Profile response
       *        schema:
       *          $ref: '#/definitions/UserResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      403:
       *        description: Error forbidden for this user
       *        schema:
       *          $ref: '#/definitions/ForbiddenError'
       */
      [
        'get', '/api/v1/admin/profile',
        this.authValidator.loggedAdminOnly,
        this.getProfile.bind(this)
      ],
      /**
       * @api {get} /api/v1/admin/users Get users with their status
       * @apiName getUsersWithStatus
       * @apiDescription Get profiles of all users with their ban status
       * @apiGroup Admin
       * @apiVersion 0.1.0
       * @apiParam {Number} [offset] Number of rows to skip
       * @apiParam {Number} limit
       * @apiParam {String} [flag] Filter param to fetch users by status
       * @apiParam {String} [search] Filter by username / email
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * [
       *   {
       *     "status": 200,
       *     "result": {
       *       "id": "1",
       *       "username": "test",
       *       "email": "test@email.com",
       *       "isEmailVerified": true,
       *       "twitchUserName": "",
       *       "twitchId": "",
       *       "googleId": "",
       *       "googleName": "",
       *       "avatar": "",
       *       "youtube": "",
       *       "facebook": "",
       *       "peerplaysAccountName": "",
       *       "bitcoinAddress": "",
       *       "userType": "viewer",
       *       "status": "banned",
       *       "ban-histories.bannedById": "2"
       *       "ban-histories.bannedAt": "2019-06-29T12:26:56.453Z"
       *     }
       *   }
       * ]
       */
      [
        'get', '/api/v1/admin/users',
        this.authValidator.loggedAdminOnly,
        this.userValidator.getUsersWithBansHistory,
        this.getUsers.bind(this)
      ],
      /**
       * @api {post} /api/v1/admin/users/ban/:userId Ban user by id
       * @apiName BanUserById
       * @apiGroup Admin
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *  "result": true,
       *  "status": 200
       * }
       */
      [
        'put', '/api/v1/admin/users/ban/:userId',
        this.authValidator.loggedAdminOnly,
        this.userValidator.banUser,
        this.banUser.bind(this)
      ],
      /**
       * @api {get} /api/v1/admin/users/ban/:userId get user info by id
       * @apiName getUserInfoById
       * @apiGroup Admin
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *  "status": 200
       *  "result": {
       *     "id": "1",
       *     "username": "test",
       *     "youtube": "",
       *     "facebook": "",
       *     "peerplaysAccountName": "",
       *     "twitchId": "42342",
       *     "twitchLink": "https://www.twitch.tv/42342/videos",
       *   }
       * }
       */
      [
        'get', '/api/v1/admin/users/info/:id',
        this.authValidator.loggedAdminOnly,
        this.userValidator.getUser,
        this.getUserInfo.bind(this)
      ]
    ];
    
  }

  async getProfile(user) {
    return this.userService.getCleanUser(user);
  }

  async getUsers(user, pure, req) {
    return this.adminService.getUsers(req.query);
  }

  async banUser(user, pure, req) {
    return this.adminService.banUser(user, req.query.userId);
  }

  async getUserInfo(user, pure, req) {
    return this.adminService.getUserInfo(req.query.id);
  }

}

module.exports = AdminController;
