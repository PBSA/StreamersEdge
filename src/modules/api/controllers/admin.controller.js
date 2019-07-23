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
       *        schema:
       *          $ref: '#/definitions/UserResponse'
       *      401:
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      403:
       *        schema:
       *          $ref: '#/definitions/ForbiddenError'
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
