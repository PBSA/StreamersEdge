const RestError = require('../../../errors/rest.error');

class StreamController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {StreamValidator} opts.streamValidator
   * @param {StreamService} opts.streamService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.streamValidator = opts.streamValidator;
    this.streamService = opts.streamService;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes() {
    return [
      /**
       * @api {get} /api/v1/stream/:id Get stream
       * @apiName GetStreamById
       * @apiDescription Get Stream by StreamId
       * @apiGroup Stream
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "result": {
       *   "id": 1,
       *   "name": "TSM chocoTaco | today's weather: thirsty",
       *   "game": "pubg",
       *   "sourceName": "twitch",
       *   "embedUrl": "",
       *   "channelId": "34608843376",
       *   "views": 3536,
       *   "isLive": true,
       *   "startTime": "2019-06-21T00:09:40.000Z",
       *   "thumbnailUrl": "https://static-cdn.jtvnw.net/previews-ttv/live_user_chocotaco-{width}x{height}.jpg",
       *   "user": {
       *       "id": 10,
       *       "username": "jotprabh",
       *       "email": "prabhjot.narula@gmail.com",
       *       "twitchUserName": null,
       *       "googleName": null,
       *       "youtube": "",
       *       "facebook": "",
       *       "peerplaysAccountName": "",
       *       "bitcoinAddress": "",
       *       "userType": null
       *     }
       *   },
       *   "status": 200
       * }
       */
      [
        'get', '/api/v1/stream/:streamId',
        this.authValidator.loggedOnly,
        this.streamValidator.validateGetStream,
        this.getStream.bind(this)
      ],
      /**
       * @api {get} /api/v1/streams Get streams
       * @apiName GetStreams
       * @apiDescription Get Streams
       * @apiGroup Stream
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "result": [
       *       {
       *           "id": 1,
       *           "name": "TSM chocoTaco | today's weather: thirsty",
       *           "game": "pubg",
       *           "sourceName": "twitch",
       *           "embedUrl": "",
       *           "channelId": "34608843376",
       *           "views": 3536,
       *           "isLive": true,
       *           "startTime": "2019-06-21T00:09:40.000Z",
       *           "thumbnailUrl": "https://static-cdn.jtvnw.net/previews-ttv/live_user_chocotaco-{width}x{height}.jpg",
       *           "user": {
       *               "id": 10,
       *               "username": "jotprabh",
       *               "email": "prabhjot.narula@gmail.com",
       *               "twitchUserName": null,
       *               "googleName": null,
       *               "youtube": "",
       *               "facebook": "",
       *               "peerplaysAccountName": "",
       *               "bitcoinAddress": "",
       *               "userType": null
       *           }
       *       }
       *   ],
       *   "status": 200
       *}
       */
      [
        'get', '/api/v1/streams',
        this.authValidator.loggedOnly,
        this.streamValidator.validateGetStreams,
        this.getStreams.bind(this)
      ],
      /**
       * @api {get} /api/v1/stream/populate-twitch-streams Get Streams for users from Twitch
       * @apiName PopulateTwitchStreams
       * @apiGroup Stream
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "status": 200,
       *   "result": true
       * }
       */
      [
        'get', '/api/v1/populate-twitch-streams',
        this.populateStreamsFromTwitch.bind(this)
      ]
    ];
  }

  async getStream(user, streamId) {
    const stream = await this.streamService.getCleanStream(streamId);

    if (!stream) {
      throw new RestError('Stream not found', 404);
    }

    return stream;
  }

  async getStreams(user, {search, limit, skip, orderBy, isAscending, isActive}) {
    if(orderBy === 'streamerName') {
      orderBy = 'users.twitchUserName';
    }

    return await this.streamService.searchStreams(search, limit, skip, orderBy, isAscending, isActive);
  }

  async populateStreamsFromTwitch() {
    try {
      return await this.streamService.populateTwitchStreams();
    } catch (e) {
      throw new RestError(e.message, 400, e.details);
    }
  }
}

module.exports = StreamController;
