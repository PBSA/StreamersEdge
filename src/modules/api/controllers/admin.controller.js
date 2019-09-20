class AdminController {

  /**
   * @swagger
   *
   * definitions:
   *  BanUserData:
   *    type: object
   *    required:
   *      - userId
   *    properties:
   *      userId:
   *        type: number
   *
   *  BanUserResponse:
   *    allOf:
   *      - $ref: '#/definitions/SuccessResponse'
   *      - type: object
   *        properties:
   *          result:
   *            $ref: '#/definitions/BanUser'
   *
   *  BanUser:
   *    type: object
   *    properties:
   *      result:
   *        type: boolean
   *
   *  UserInfoResponse:
   *    allOf:
   *      - $ref: '#/definitions/SuccessResponse'
   *      - type: object
   *        properties:
   *          result:
   *            $ref: '#/definitions/UserInfo'
   *
   *  UserInfo:
   *    type: object
   *    properties:
   *      id:
   *        type: number
   *      username:
   *        type: string
   *      peerplaysAccountName:
   *        type: string
   *      facebook:
   *        type: string
   *      youtube:
   *        type: string
   *      twitchId:
   *        type: number
   *      twitchLink:
   *        type: string
   *
   *  AdminUsersResponse:
   *    allOf:
   *      - $ref: '#/definitions/SuccessResponse'
   *      - type: object
   *        properties:
   *          result:
   *            $ref: '#/definitions/AdminUsers'
   *
   *  AdminUsers:
   *    type: object
   *    properties:
   *      id:
   *        type: number
   *      username:
   *        type: string
   *      email:
   *        type: string
   *      isEmailVerified:
   *        type: boolean
   *      twitchUserName:
   *        type: string
   *      twitchId:
   *        type: number
   *      googleId:
   *        type: number
   *      googleName:
   *        type: string
   *      avatar:
   *        type: string
   *      youtube:
   *        type: string
   *      facebook:
   *        type: string
   *      peerplaysAccountName:
   *        type: string
   *      bitcoinAddress:
   *        type: string
   *      userType:
   *        type: string
   *      status:
   *        type: string
   *      ban-histories.bannedById:
   *        type: number
   *      ban-histories.bannedAt:
   *        type: string
   *
   *  ReportResponse:
   *    type: array
   *    items:
   *      type: object
   *      properties:
   *          id:
   *            type: number
   *            example: 1
   *          reportedUserId:
   *            type: number
   *            example: 2
   *          reportedByUserId:
   *            type: number
   *            example: 1
   *          reason:
   *            type: string
   *            example: vulgarity-on-stream
   *          description:
   *            type: string
   *          videoUrl:
   *            type: string
   *            example: /profile_images/UsmhsMzlzx-HwFX6wsQiLrjN-RZqP0WNz.mp4
   *          reporter:
   *            type: object
   *            properties:
   *              username:
   *                type: string
   *                example: abc
   *          troublemaker:
   *            type: object
   *            properties:
   *              email:
   *                type: string
   *                example: abc@pbsa.info
   *              username:
   *                type: string
   *                example: abc
   *              userType:
   *                type: string
   *                example: admin
   *              avatar:
   *                type: string
   *                example: /profile_images/81vg5oejxn-BoDgqJ1Bm1cXY-soctGdMU.jpg
   *
   */

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
    this.userService = opts.userService;
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
       *          $ref: '#/definitions/AdminUsersResponse'
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
       * @swagger
       *
       * /admin/users:
       *  get:
       *    description: Get profiles of all users with their ban status
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    parameters:
       *      - name: flag
       *        description: Filter param to fetch users by status
       *        in: query
       *        required: false
       *        type: string
       *      - name: search
       *        description: Filter by username / email
       *        in: query
       *        required: false
       *        type: string
       *      - name: offset
       *        description: Number of rows to skip
       *        in: query
       *        required: false
       *        type: integer
       *      - name: limit
       *        description: Limit of rows
       *        in: query
       *        required: true
       *        type: integer
       *    responses:
       *      200:
       *        description: getUsersWithStatus response
       *        schema:
       *          $ref: '#/definitions/AdminUsersResponse'
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
        'get', '/api/v1/admin/users',
        this.authValidator.loggedAdminOnly,
        this.userValidator.getUsersWithBansHistory,
        this.getUsers.bind(this)
      ],
      /**
       * @swagger
       *
       * /admin/users/ban/{userId}:
       *  put:
       *    description: Ban user by id
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    parameters:
       *      - name: userId
       *        in: path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: Ban result schema
       *        schema:
       *          $ref: '#/definitions/BanUserResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      403:
       *        description: Error forbidden for this user
       *        schema:
       *          $ref: '#/definitions/ForbiddenError'
       *      400:
       *        description: Error this user does not exist
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 404
       *            error:
       *              type: string
       *              example: This user does not exist
       *      404:
       *        description: Error user not found
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 404
       *            error:
       *              type: string
       *              example: User not found
       */
      [
        'put', '/api/v1/admin/users/ban/:userId',
        this.authValidator.loggedAdminOnly,
        this.userValidator.banUser,
        this.banUser.bind(this)
      ],
      /**
       * @swagger
       *
       * /admin/users/unban/{userId}:
       *  put:
       *    description: Uban user by id
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    parameters:
       *      - name: userId
       *        in: path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: Unban result schema
       *        schema:
       *          $ref: '#/definitions/SuccessEmptyResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      403:
       *        description: Error forbidden for this user
       *        schema:
       *          $ref: '#/definitions/ForbiddenError'
       *      400:
       *        description: Error this user does not exist
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 404
       *            error:
       *              type: string
       *              example: This user does not exist
       *      404:
       *        description: Error user not found
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 404
       *            error:
       *              type: string
       *              example: User not found
       */
      [
        'put', '/api/v1/admin/users/unban/:userId',
        this.authValidator.loggedAdminOnly,
        this.userValidator.unbanUser,
        this.unbanUser.bind(this)
      ],
      /**
       * @swagger
       *
       * /admin/users/info/{id}:
       *  get:
       *    description: Get user info by id
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    parameters:
       *      - name: id
       *        description: User id
       *        in: path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: User response
       *        schema:
       *          $ref: '#/definitions/UserInfoResponse'
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
        'get', '/api/v1/admin/users/info/:id',
        this.authValidator.loggedAdminOnly,
        this.userValidator.getUser,
        this.getUserInfo.bind(this)
      ],
      /**
       * @swagger
       *
       * /admin/reports/:
       *  get:
       *    description: Get all reports
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    responses:
       *      200:
       *        description: Report result schema
       *        schema:
       *          $ref: '#/definitions/ReportResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      403:
       *        description: Error forbidden for this user
       *        schema:
       *          $ref: '#/definitions/ForbiddenError'
       */
      ['get', '/api/v1/admin/reports',
        this.authValidator.loggedAdminOnly,
        this.getAllReports.bind(this)
      ]
    ];

  }

  async unbanUser(user, pure, req) {
    return this.adminService.unbanUser(user, req.query.userId);
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

  async getAllReports() {
    return this.adminService.getReports();
  }

}

module.exports = AdminController;
