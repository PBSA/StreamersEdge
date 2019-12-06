const RestError = require('../../../errors/rest.error');

/**
 * @swagger
 *
 * definitions:
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
 *      ppyAmount:
 *        type: number
 *      depositOp:
 *        $ref: '#/definitions/TransactionObject'
 *  JoinSuccessResponse:
 *    type: object
 *    properties:
 *      createdAt:
 *        type: string
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
       * /challenges/wins/{userId}:
       *  get:
       *    description: Get all challenges won by a user
       *    produces:
       *      - application/json
       *    tags:
       *     - Challenge
       *    parameters:
       *      - name: userId
       *        in: path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: List of won challenges
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
        'get', '/api/v1/challenges/wins/:userId',
        this.authValidator.loggedOnly,
        this.challengeValidator.getWonChallenges,
        this.getWonChallenges.bind(this)
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
        this.challengeValidator.validateGetChallenge,
        this.getChallenge.bind(this)
      ],
      /**
             *
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
      // [
      //   'post', '/api/v1/challenges/invite',
      //   this.authValidator.loggedOnly,
      //   this.challengeValidator.invite,
      //   this.sendInvite.bind(this)
      // ],

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
             *    parameters:
             *      - name: searchText
             *        description: Filter by the searchText
             *        in: query
             *        required: false
             *        type: string
             *      - name: order
             *        description: Receives challenges in a particular order
             *        in: query
             *        required: false
             *        type: string
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
        this.challengeValidator.getAllChallenges,
        this.getAllChallenges.bind(this)
      ],

      /**
             * @swagger
             * /challenges/conditionaldonate:
             *  post:
             *    description: Conditionally donate to a challenge
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
        'post', '/api/v1/challenges/conditionaldonate',
        this.authValidator.loggedOnly,
        this.challengeValidator.joinToChallenge,
        this.joinToChallenge.bind(this)
      ]
    ];
  }

  async createChallenge(user, challenge) {
    try {
      const result = await this.challengeService.createChallenge(user, challenge);

      result.joined = false;
      result.joinedUsers = [];
      
      const validKeys = ['username','avatar'];
      Object.keys(result.user).forEach((key) => validKeys.includes(key) || delete result.user[key]);

      return result;
    } catch (err) {
      throw err;
    }
  }

  async getChallenge(user, challengeId) {
    try {
      const result = await this.challengeService.getCleanObject(challengeId);

      result.joined = await this.joinedUsersRepository.hasUserJoined(user.id, challengeId);
      result.joinedUsers = await this.joinedUsersRepository.getForChallenge(challengeId);

      const validKeys = ['username','avatar'];
      Object.keys(result.user).forEach((key) => validKeys.includes(key) || delete result.user[key]);

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

  async fillChallengeDetails(challenge, userId) {
    challenge.conditions = challenge['challenge-conditions'];

    if(userId) {
      challenge.joined = await this.joinedUsersRepository.hasUserJoined(userId, challenge.id);
    }

    challenge.joinedUsers = await this.joinedUsersRepository.getForChallenge(challenge.id);

    delete challenge['challenge-conditions'];

    return challenge;
  }

  async getAllChallenges(user, query) {
    let challenges = await this.challengeService.getAllChallenges(user && user.id, query);
    challenges = await Promise.all(challenges.map((c) => this.fillChallengeDetails(c.toJSON(), user && user.id)));
    
    //order by total donations
    if(query.order === 'totalDonations') {
      challenges = await Promise.all(challenges.sort((a, b) => (this.calculateTotalReward(a) < this.calculateTotalReward(b)) ? 1 : -1));
    }

    return challenges;
  }

  calculateTotalReward(challenge) {
    return challenge.joinedUsers.reduce((sum, user) => {
      return sum + user.totalDonation;
    }, 0);
  }

  async getWonChallenges(user, userId) {
    let challenges = await this.challengeService.getWonChallenges(userId);
    return Promise.all(challenges.map((c) => this.fillChallengeDetails(c.toJSON(), user.id)));
  }

  async joinToChallenge(user, {challengeId, depositOp, ppyAmount}) {
    try {
      return await this.challengeService.joinToChallenge(user.id, challengeId, {depositOp, ppyAmount});
    } catch (err) {
      switch (err.message) {
        case this.challengeService.errors.CHALLENGE_NOT_FOUND:
          throw new RestError('', 404, {challenge: [{message: 'This challenge not found'}]});
        case this.challengeService.errors.CHALLENGE_NOT_OPEN:
          throw new RestError('', 422, {challenge: [{message: 'This challenge is not open for joining'}]});
        case this.challengeService.errors.CANNOT_JOIN_OWN_CHALLENGE:
          throw new RestError('', 422, {challenge: [{message: 'You cannot join your own challenges'}]});
        case this.challengeService.errors.DO_NOT_RECEIVE_INVITATIONS:
          throw new RestError('', 422, {challenge: [{message: 'This is private challenge'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_SENDER:
          throw new RestError('', 422, {depositOp: [{from: 'Invalid transaction sender'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_RECEIVER:
          throw new RestError('', 422, {depositOp: [{to: 'Invalid transaction receiver'}]});
        case this.challengeService.errors.INVALID_TRANSACTION_AMOUNT:
          throw new RestError('', 422, {depositOp: [{amount: 'Invalid transaction amount'}]});
        case this.challengeService.errors.INSUFFICIENT_BALANCE:
          throw new RestError('', 422, {depositOp: [{amount: 'Insufficient balance'}]});
        case this.challengeService.errors.TRANSACTION_ERROR:
          throw new RestError('', 422, {depositOp: [{signature: err.data.message}]});
        default:
          throw err;
      }
    }

  }

}

module.exports = ChallengesController;
