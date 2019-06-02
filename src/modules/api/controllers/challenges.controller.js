const RestError = require('../../../errors/rest.error');

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
       * @apiDefine ChallengeObjectResponse
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *  "result": {
       *    "id": 2,
       *    "name": "Test name",
       *    "createdAt": "2019-04-04T08:32:19.818Z",
       *    "startDate": null,
       *    "endDate": null,
       *    "game": "pubg",
       *    "accessRule": "anyone",
       *    "ppyAmount": "1",
       *    "user": {
       *      "id": 1,
       *      "username": "User Name",
       *      "youtube": "",
       *      "facebook": "",
       *      "peerplaysAccountName": "",
       *      "bitcoinAddress": ""
       *    },
       *    "criteria": {
       *      "id": 2,
       *      "shouldLead": true,
       *      "shouldKill": null,
       *      "shouldWinPerTime": null,
       *      "minPlace": null,
       *      "createdAt": "2019-04-04T08:32:19.831Z",
       *      "updatedAt": "2019-04-04T08:32:19.831Z",
       *      "challengeId": 2
       *    },
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
       *   "params": {
       *     "shouldLead": true,
       *     "shouldKill": 1,
       *     "shouldWinPerTime": 3,
       *     "minPlace": 3
       *   }
       * }
       * @apiParam {String} name Name of challenge
       * @apiParam {Date} [startDate] Date of start challenge in ISO format
       * @apiParam {Date} [endDate] Date of end challenge in ISO format
       * @apiParam {String} game Type of challenge game. Now can be 'pubg' only
       * @apiParam {String} accessRule Type of access - anyone or invite
       * @apiParam {Number} ppyAmount PPY Amount for challenge in "satoshis"
       * @apiParam {Boolean} [param.shouldLead] Criteria. User should win to pass the challenge
       * @apiParam {Number} [param.shouldKill] Criteria. User should kill specifies count of frags to pass the challenge
       * @apiParam {Number} [param.shouldWinPerTime] Criteria. User should win per specified count of minutes
       * @apiParam {Number} [param.minPlace] Criteria. Should end game on the specified place or higher
       * @apiUse ChallengeObjectResponse
       */
      [
        'post', '/api/v1/challenges',
        this.authValidator.loggedOnly,
        this.challengeValidator.createChallenge,
        this.createChallenge.bind(this)
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

}

module.exports = ChallengesController;
