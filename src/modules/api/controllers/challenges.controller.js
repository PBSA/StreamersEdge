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
 *  Operation:
 *    type: object
 *    properties:
 *      fee:
 *        type: object
 *        properties:
 *          amount:
 *            type: string
 *            example: '20000'
 *          asset_id:
 *            type: string
 *            example: '1.3.0'
 *      from:
 *        type: string
 *        example: '1.2.67'
 *      to:
 *        type: string
 *        example: '1.2.57'
 *      amount:
 *        type: object
 *        properties:
 *          amount:
 *            type: string
 *            example: '1000'
 *          asset_id:
 *            type: string
 *            example: '1.3.0'
 *      extensions:
 *        type: array
 *        items: {}
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
 *  ChallengeJoin:
 *    type: object
 *    required:
 *      - challengeId
 *    properties:
 *      challengeId:
 *        type: number
 *      joinOp:
 *        $ref: '#/definitions/TransactionObject'
 *  JoinSuccessResponse:
 *    type: object
 *    properties:
 *      joinedAt:
 *        type: string
 *      isPlayed:
 *        type: boolean
 *      id:
 *        type: number
 *      challengeId:
 *        type: number
 *      userId:
 *        type: number
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
     * @param {JoinedUsersRepository} opts.joinedUsersRepository
     */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.challengeService = opts.challengeService;
    this.challengeValidator = opts.challengeValidator;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
    this.joinedUsersRepository = opts.joinedUsersRepository;
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
             * @swagger
             *
             * /challenges:
             *  get:
             *    description: Get all challenges
             *    produces:
             *      - application/json
             *    tags:
             *     - Challenge
             *    responses:
             *      200:
             *        description: Get list of all challenge
             *        schema:
             *          $ref: '#/definitions/ChallengeResponse'
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
        'get', '/api/v1/challenges',
        this.authValidator.loggedOnly,
        this.getAllChallenges.bind(this)
      ],

      /**
             * @swagger
             * /challenges/join:
             *  post:
             *    description:  Join user to challenge
             *    produces:
             *      - application/json
             *    tags:
             *      - Challenge
             *    parameters:
             *      - name: ChallengeJoin
             *        in: body
             *        required: true
             *        schema:
             *          $ref: '#/definitions/ChallengeJoin'
             *    responses:
             *      200:
             *        description: Join Success response
             *        schema:
             *         $ref: '#/definitions/JoinSuccessResponse'
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
    } catch (err) {
      switch (err.message) {
        case this.userService.errors.INVALID_PPY_AMOUNT:
          throw new RestError('', 400, {ppyAmount: [{message: 'Invalid value'}]});
        default:
          throw err;
      }
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

      result.joined = await this.joinedUsersRepository.hasUserJoined(user.id, challengeId);
      result.joinedUsers = await this.joinedUsersRepository.getForChallenge(challengeId);

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
    const result = await this.challengeService.checkUserSubscribe(user, data);
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
        case this.challengeService.errors.UNABLE_TO_INVITE:
          throw new RestError('', 422, {challengeId: [{message: 'Unable to invite'}]});
        case this.challengeService.errors.INVITED_USER_NOT_FOUND:
          throw new RestError('', 422, {userId: [{message: 'Invited user not found'}]});
        default:
          throw err;
      }

    }

  }

  async getAllChallenges(user) {
    let challenges = await this.challengeService.getAllChallenges(user.id);
    challenges = challenges.map((c) => c.toJSON());
    
    challenges = await Promise.all(challenges.map(async (challenge) => {
      challenge.conditions = challenge['challenge-conditions'];
      challenge.joined = await this.joinedUsersRepository.hasUserJoined(user.id, challenge.id);
      challenge.joinedUsers = await this.joinedUsersRepository.getForChallenge(challenge.id);

      delete challenge['challenge-invited-users'];
      delete challenge['challenge-conditions'];

      return challenge;
    }));

    return challenges;
  }

  async joinToChallenge(user, {challengeId, joinOp}) {
    try {
      return await this.challengeService.joinToChallenge(user.id, challengeId, joinOp);
    } catch (err) {
      switch (err.message) {
        case this.challengeService.errors.CHALLENGE_NOT_FOUND:
          throw new RestError('', 404, {challenge: [{message: 'This challenge not found'}]});
        case this.challengeService.errors.CHALLENGE_NOT_OPEN:
          throw new RestError('', 422, {challenge: [{message: 'This challenge is not open for joining'}]});
        case this.challengeService.errors.DO_NOT_RECEIVE_INVITATIONS:
          throw new RestError('', 422, {challenge: [{message: 'This is private challenge'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_SENDER:
          throw new RestError('', 422, {joinOp: [{from: 'Invalid transaction sender'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_RECEIVER:
          throw new RestError('', 422, {joinOp: [{to: 'Invalid transaction receiver'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_AMOUNT:
          throw new RestError('', 422, {joinOp: [{amount: 'Invalid transaction amount'}]});
        case this.challengeService.errors.TRANSACTION_ERROR:
          throw new RestError('', 422, {joinOp: [{signature: err.data.message}]});
        default:
          throw err;
      }
    }

  }

}

module.exports = ChallengesController;
