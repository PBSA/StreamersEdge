const RestError = require('../../../errors/rest.error');
const {accessRules} = require('../../../constants/challenge');

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
       * @apiDefine ChallengeObjectResponse
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *  "result": {
       *    "id": 11,
       *    "name": "test",
       *    "createdAt": "2019-06-02T06:11:44.866Z",
       *    "startDate": "2019-07-04T08:32:19.818Z",
       *    "endDate": null,
       *    "game": "pubg",
       *    "accessRule": "anyone",
       *    "ppyAmount": "1",
       *    "conditionsText": "test",
       *    "user": {
       *      "id": 1,
       *      "username": "username",
       *      "youtube": "",
       *      "facebook": "",
       *      "peerplaysAccountName": "",
       *      "bitcoinAddress": ""
       *    },
       *    "conditions": [{
       *      "id": 4,
       *      "param": "resultPlace",
       *      "operator": ">",
       *      "value": 1,
       *      "join": "OR",
       *      "createdAt": "2019-06-02T06:11:44.874Z",
       *      "updatedAt": "2019-06-02T06:11:44.874Z",
       *      "challengeId": 11
       *    }, {
       *      "id": 5,
       *      "param": "resultPlace",
       *      "operator": ">",
       *      "value": 1,
       *      "join": "END",
       *      "createdAt": "2019-06-02T06:11:44.875Z",
       *      "updatedAt": "2019-06-02T06:11:44.875Z",
       *      "challengeId": 11
       *    }],
       *    "invitedUsers": []
       *  },
       *  "status": 200
       * }
       */

      /**
       * @api {post} /api/v1/challenges Create new challenge
       * @apiName CreateChallenge
       * @apiGroup Challenges
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "name": "Test name",
       *   "startDate": "2019-04-04T08:32:19.818Z",
       *   "endDate": "2019-04-04T08:32:19.818Z",
       *   "game": "pubg",
       *   "accessRule": "anyone",
       *   "ppyAmount": 100,
       *   "invitedAccounts": [],
       *   "conditionsText": [],
       *   "conditions": [{
       *     "param": "resultPlace",
       *     "operator": ">",
       *     "value": 1,
       *     "join": "END"
       *   }]
       * }
       * @apiParam {String} name Name of challenge
       * @apiParam {Date} [startDate] Date of start challenge in ISO format
       * @apiParam {Date} [endDate] Date of end challenge in ISO format
       * @apiParam {String} game Type of challenge game. Now can be 'pubg' only
       * @apiParam {String} accessRule Type of access - anyone or invite
       * @apiParam {Number} ppyAmount PPY Amount for challenge in "satoshis"
       * @apiParam {String} [conditionsText] Required only if conditions is empty
       * @apiParam {Object[]} [conditions] Conditions array
       * @apiParam {String} [conditions.param] result_place, win_time, frags
       * @apiParam {String} [conditions.operator] \>, <, =, >=, <=
       * @apiParam {Number} [conditions.value] Can be integer number
       * @apiParam {String} [conditions.join] AND, OR or END. END can be used once
       * @apiUse ChallengeObjectResponse
       */
      [
        'post', '/api/v1/challenges',
        this.authValidator.loggedOnly,
        this.challengeValidator.createChallenge,
        this.createChallenge.bind(this)
      ],
      /**
       * @api {get} /api/v1/challenges/:id Get challenge by id
       * @apiName GetChallenge
       * @apiGroup Challenges
       * @apiVersion 0.1.0
       * @apiUse ChallengeObjectResponse
       */
      [
        'get', '/api/v1/challenges/:id',
        this.authValidator.loggedOnly,
        this.challengeValidator.validateGetChallenge,
        this.getChallenge.bind(this)
      ],
      [
        /**
         * @api {post} /api/v1/challenges/subscribe Subscribe to new notification
         * @apiName SubscribeNotification
         * @apiGroup Challenges
         * @apiVersion 0.1.0
         * @apiExample {json} Request-Example:
         * {
         *   endpoint: 'https://fcm.googleapis.com/...lbTgv66-WEEWWK9bxZ_ksHhV_Z49vBvnYZdeS6cL6kk',
         *   expirationTime: null,
         *   keys:
         *    {
         *      p256dh: 'BOQWqnde....j7Dk-o',
         *      auth: 'EYFQS0dh2KaPMXx9nmVPww'
         *    }
         * }
         * @apiParam {String} endpoint url for user
         * @apiParam {Number} expirationTime time of expiration
         * @apiParam {Object} keys object
         * @apiParam {String} [keys.p256dh] string in p256dh
         * @apiParam {String} [keys.auth] auth string
         * @apiSuccessExample {json} Success-Response:
         * HTTP/1.1 200 OK
         * {
         *  "result": "BOQWqndev7VP-UCLv9QIqDtkcNwRjyu4QBPDTCymL6ILHWklqWP1XxXRLmAYywsfgGs7K8Yub_6jQKiN0j7Dk-o",
         *  "status": 200
         * }
         */
        'post', '/api/v1/challenges/subscribe',
        this.challengeValidator.subscribe,
        this.subscribeToChallenges.bind(this)
      ],
      [
        /**
         * @api {post} /api/v1/challenges/invite Invite user to new challenge
         * @apiName InviteToChallenge
         * @apiGroup Challenges
         * @apiVersion 0.1.0
         * @apiUse ChallengeObjectResponse
         * @apiExample {json} Request-Example:
         * {
         *   "userId": "6",
         *   "challengeId": "107",
         * }
         * @apiParam {Number} userId Invited user Id
         * @apiParam {Number} challengeId Id of of challenge
         */
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
    return await this.challengeService.createChallenge(user.id, challenge);
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
      return await this.challengeService.sendInvite(user, userId, challengeId);
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
