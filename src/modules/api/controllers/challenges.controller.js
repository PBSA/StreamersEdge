const RestError = require('../../../errors/rest.error');

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
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.challengeService = opts.challengeService;
    this.challengeValidator = opts.challengeValidator;
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
       *        type: string
       *        schema:
       *          $ref: '#/definitions/ChallengeFullNew'
       *    responses:
       *      200:
       *        schema:
       *          $ref: '#/definitions/ChallengeResponse'
       *      401:
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
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
       *        schema:
       *         $ref: '#/definitions/ChallengeResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      404:
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
       *        type: string
       *        schema:
       *          $ref: '#/definitions/ChallengeSubscribe'
       *    responses:
       *      200:
       *        schema:
       *         $ref: '#/definitions/ChallengeSubscribeResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
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
       *        type: string
       *        schema:
       *          $ref: '#/definitions/ChallengeInvite'
       *    responses:
       *      200:
       *        schema:
       *         $ref: '#/definitions/SuccessEmptyResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'post', '/api/v1/challenges/invite',
        this.authValidator.loggedOnly,
        this.challengeValidator.invite,
        this.sendInvite.bind(this)
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

  async getChallenge(user, id) {
    const challenge = await this.challengeService.getCleanObject(id);

    if (!challenge) {
      throw new RestError('Challenge not found', 404);
    }

    return challenge;
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
        default:
          throw err;
      }

    }

  }

}

module.exports = ChallengesController;
