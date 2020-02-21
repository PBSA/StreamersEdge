class JobsController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {ChallengeService} opts.challengeService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.jobsService = opts.jobsService;
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
       * /admin/jobs/games:
       *  get:
       *    description: Run the games job
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    responses:
       *      200:
       *        description: Job call success
       *        schema:
       *          $ref: '#/definitions/SuccessResponse'
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
        'get', '/api/v1/admin/jobs/games',
        this.authValidator.loggedAdminOnly,
        this.resolveGames.bind(this)
      ],
      /**
       * @swagger
       *
       * /admin/jobs/payments:
       *  get:
       *    description: Run the payments job
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    responses:
       *      200:
       *        description: Job call success
       *        schema:
       *          $ref: '#/definitions/SuccessResponse'
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
        'get', '/api/v1/admin/jobs/payments',
        this.authValidator.loggedAdminOnly,
        this.resolvePayments.bind(this)
      ],
      /**
       * @swagger
       *
       * /admin/jobs/payouts:
       *  get:
       *    description: Run the payouts job
       *    produces:
       *      - application/json
       *    tags:
       *      - Admin
       *    responses:
       *      200:
       *        description: Job call success
       *        schema:
       *          $ref: '#/definitions/SuccessResponse'
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
        'get', '/api/v1/admin/jobs/payouts',
        this.authValidator.loggedAdminOnly,
        this.sendPayouts.bind(this)
      ]
    ];

  }

  async resolveGames() {
    return this.jobsService.runGamesJob();
  }

  async resolvePayments() {
    return this.jobsService.runPaymentsJob();
  }

  async sendPayouts() {
    return this.jobsService.runPayoutsJob();
  }
}

module.exports = JobsController;