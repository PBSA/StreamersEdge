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
       * @apiDescription Get Stream by id
       * @apiGroup Stream
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "status": 200,
       *   "result": {
       *     "id": "5cc315041ec568398b99d7ca",
       *     "username": "test",
       *     "youtube": "",
       *     "facebook": "",
       *     "peerplaysAccountName": "",
       *     "bitcoinAddress": ""
       *   }
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
       *   "status": 200,
       *   "result": [{
       *     "id": "5cc315041ec568398b99d7ca",
       *     "username": "test",
       *     "youtube": "",
       *     "facebook": "",
       *     "peerplaysAccountName": "",
       *     "bitcoinAddress": ""
       *   }]
       * }
       */
      [
        'get', '/api/v1/streams',
        this.authValidator.loggedOnly,
        this.streamValidator.validateGetStreams,
        this.getStreams.bind(this)
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
    skip = skip || 0;
    orderBy = orderBy || 'id';
    isAscending = isAscending || true;
    isActive = isActive || true;
    return await this.streamService.searchStreams(search, limit, skip, orderBy, isAscending, isActive);
  }
}

module.exports = StreamController;
