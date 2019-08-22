const RestError = require('../../../errors/rest.error');
const {accessRules} = require('../../../constants/challenge');

/**
 * @swagger
 *
 * definitions:
 *  ChallengeSubscribe:
 *    type: object
 *    required:
 *      - endpoint
 *      - keys
 *    properties:
 *      endpoint:
 *        type: string
 *      expirationTime:
 *        type: number
 *      keys:
 *        type: object
 *        properties:
 *          p256dh:
 *            type: string
 *          auth:
 *            type: string
 *  ChallengeInvite:
 *    type: object
 *    required:
 *      - userId
 *      - challengeId
 *    properties:
 *      userId:
 *        type: number
 *      challengeId:
 *        type: number
 *
 *  ChallengeResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            $ref: '#/definitions/Challenge'
 *
 *  ChallengeSubscribeResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            type: string
 *
 */


class ChallengesController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {ChallengeValidator} opts.challengeValidator
   * @param {ChallengeService} opts.challengeService
   * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.challengeService = opts.challengeService;
    this.challengeValidator = opts.challengeValidator;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
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
       * /challenges:
       *  post:
       *    description: Create new challenge
       *    summary: Create new challenge
       *    produces:
       *      - application/json
       *    tags:
       *      - Challenge
       *    parameters:
       *      - name: challenge
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/ChallengeFullNew'
       *    responses:
       *      200:
       *        description: Challenge response
       *        schema:
       *          $ref: '#/definitions/ChallengeResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      422:
       *        description: Error unable to sent invitation
       *        schema:
       *          $ref: '#/definitions/UnProcessableError'
       */
      [
        'post', '/api/v1/challenges',
        this.authValidator.loggedOnly,
        this.challengeValidator.createChallenge,
        this.createChallenge.bind(this)
      ],
      /**
       * @swagger
       *
       * /challenges/{id}:
       *  get:
       *    description: Get challenge by id
       *    summary: Get challenge by id
       *    produces:
       *      - application/json
       *    tags:
       *      - Challenge
       *    parameters:
       *      - name: id
       *        in: path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: Challenge response
       *        schema:
       *         $ref: '#/definitions/ChallengeResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      404:
       *        description: Error challenge not found
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 404
       *            error:
       *              type: string
       *              example: Challenge not found
       */
      [
        'get', '/api/v1/challenges/:id',
        this.authValidator.loggedOnly,
        this.challengeValidator.validateGetChallenge,
        this.getChallenge.bind(this)
      ],
      /**
       * @swagger
       *
       * /challenges/subscribe:
       *  post:
       *    description: Subscribe to new notification
       *    summary: Subscribe to new notification
       *    produces:
       *      - application/json
       *    tags:
       *      - Challenge
       *    parameters:
       *      - name: ChallengeSubscribe
       *        in: body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/ChallengeSubscribe'
       *    responses:
       *      200:
       *        description: Subscribe response
       *        schema:
       *         $ref: '#/definitions/ChallengeSubscribeResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'post', '/api/v1/challenges/subscribe',
        this.authValidator.loggedOnly,
        this.challengeValidator.subscribe,
        this.subscribeToChallenges.bind(this)
      ],
      /**
       * @swagger
       *
       * /challenges/invite:
       *  post:
       *    description: Invite user to new challenge
       *    summary: Invite user to new challenge
       *    produces:
       *      - application/json
       *    tags:
       *      - Challenge
       *    parameters:
       *      - name: ChallengeInvite
       *        in: body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/ChallengeInvite'
       *    responses:
       *      200:
       *        description: Invite response
       *        schema:
       *         $ref: '#/definitions/SuccessEmptyResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      402:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'post', '/api/v1/challenges/invite',
        this.authValidator.loggedOnly,
        this.challengeValidator.invite,
        this.sendInvite.bind(this)
      ],

      /**
       * @api {get} /api/v1/challenges Get all challenges
       * @apiName GetChallenges
       * @apiGroup Challenges
       * @apiVersion 0.1.0
       * @apiUse ChallengeObjectResponse
       */
      [
        'get', '/api/v1/challenges',
        this.authValidator.loggedOnly,
        this.getAllChallenges.bind(this)
      ],
      [
        /**
         * @api {post} /api/v1/challenges/join Join user to challenge
         * @apiName JoinToChallenge
         * @apiGroup Challenges
         * @apiVersion 0.1.0
         * @apiUse ChallengeObjectResponse
         * @apiExample {json} Request-Example:
         * {
         *   "challengeId": "107",
         *   "tx": {
         *     {
         *       ref_block_num: 37792,
         *       ref_block_prefix: 2533853773,
         *       expiration: '2019-06-28T14:17:57',
         *       operations:
         *         [0,
         *           {
         *             fee: {amount: '2000000', asset_id: '1.3.0'},
         *             from: '1.2.54',
         *             to: '1.2.55',
         *             amount: {amount: '10000', asset_id: '1.3.0'},
         *             memo: undefined,
         *             extensions: []
         *           }],
         *       extensions: [],
         *       signatures: ['1f2baa40114f8ed62ec1d3979b5...343716bd033262']
         *     }
         *   }
         * }
         * @apiParam {Number} challengeId User join to this challenge
         * @apiParam {Object} tx transaction for this challenge
         * @apiSuccessExample {json} Success-Response:
         * HTTP/1.1 200 OK
         * {
         *  "result": {
         *    "joinedAt": "2019-06-26T14:46:29.415Z",
         *    "isPayed": false,
         *    "id": 4,
         *    "challengeId": 15,
         *    "userId": 6,
         *    "updatedAt": "2019-06-26T14:46:29.416Z",
         *    "createdAt": "2019-06-26T14:46:29.416Z"
         *  }
         *  "status": 200
         * }
         */
        'post', '/api/v1/challenges/join',
        this.authValidator.loggedOnly,
        this.challengeValidator.joinToChallenge,
        this.joinToChallenge.bind(this)
      ]
    ];
  }

  async createChallenge(user, challenge) {
    try {
      return await this.challengeService.createChallenge(user.id, challenge);
    } catch (e) {
      throw new RestError(e.message, 404);
    }
  }

  async getChallenge(user, challengeId) {
    try {
      const result = await this.challengeService.getCleanObject(challengeId);

      if (result.accessRule === accessRules.invite && result.userId !== user.id) {

        if (!await this.challengeInvitedUsersRepository.isUserInvited(result.id, user.id)) {
          throw new RestError('', 422, {challenge: [{message: 'This is private challenge'}]});
        }
      }

      return result;
    } catch (err) {
      switch (err) {
        case this.challengeService.errors.CHALLENGE_NOT_FOUND:
          throw new RestError('', 404, {challenge: [{message: 'This challenge not found'}]});

        default:
          throw err;
      }
    }
  }

  async subscribeToChallenges(user, data) {
    const result = await this.challengeService.checkUserSubscribe(user.id);
    this.challengeService.vapidData[user.id] = data;

    return result;

  }

  async sendInvite(user, {userId, challengeId}) {
    try {
      await this.challengeService.sendInvite(user, userId, challengeId);
      return true;
    } catch (err) {
      switch (err) {
        case this.challengeService.errors.CHALLENGE_NOT_FOUND:
          throw new RestError('', 404, {challengeId: [{message: 'Challenge not found'}]});
        case this.challengeService.errors.DO_NOT_RECEIVE_INVITATIONS:
          throw new RestError('', 422, {challengeId: [{message: 'This is private challenge'}]});
        case this.errors.UNABLE_TO_INVITE:
          throw new RestError('', 422, {challengeId: [{message: 'Unable to invite'}]});
        default:
          throw err;
      }

    }

  }

  async getAllChallenges(user) {
    const allChallenges = await this.challengeService.getAllChallenges(user.id);

    for (const challenge of allChallenges) {
      delete challenge.dataValues['challenge-invited-users'];
    }

    return allChallenges;
  }

  async joinToChallenge(user, {challengeId, tx}) {
    try {
      return await this.challengeService.joinToChallenge(user.id, challengeId, tx);
    } catch (err) {
      switch (err.message) {
        case this.challengeService.errors.CHALLENGE_NOT_FOUND:
          throw new RestError('', 404, {challenge: [{message: 'This challenge not found'}]});
        case this.challengeService.errors.DO_NOT_RECEIVE_INVITATIONS:
          throw new RestError('', 422, {challenge: [{message: 'This is private challenge'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_SENDER:
          throw new RestError('', 422, {tx: [{from: 'Invalid transaction sender'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_RECEIVER:
          throw new RestError('', 422, {tx: [{to: 'Invalid transaction receiver'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_AMOUNT:
          throw new RestError('', 422, {tx: [{amount: 'Invalid transaction amount'}]});
        case this.challengeService.errors.TRANSACTION_ERROR:
          throw new RestError('', 422, {tx: [{signature: err.data.message}]});
        default:
          throw err;
      }
    }
  }

}

module.exports = ChallengesController;
