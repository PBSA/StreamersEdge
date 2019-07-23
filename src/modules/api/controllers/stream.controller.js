const RestError = require('../../../errors/rest.error');

/**
 * @swagger
 *
 * definitions:
 *  StreamGet:
 *    type: object
 *    required:
 *      - name
 *      - activeKey
 *      - ownerKey
 *    properties:
 *      name:
 *        type: string
 *      activeKey:
 *        type: string
 *      ownerKey:
 *        type: string
 *  StreamResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            $ref: '#/definitions/Stream'
 *  StreamsResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            type: array
 *            items:
 *              $ref: '#/definitions/Stream'
 */

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
       * @swagger
       *
       * /stream/{id}:
       *  get:
       *    description: Get stream
       *    summary: Get stream
       *    produces:
       *      - application/json
       *    tags:
       *      - Stream
       *    parameters:
       *      - name: id
       *        in: path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        schema:
       *         $ref: '#/definitions/StreamResponse'
       *      401:
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'get', '/api/v1/stream/:streamId',
        this.authValidator.loggedOnly,
        this.streamValidator.validateGetStream,
        this.getStream.bind(this)
      ],
      /**
       * @swagger
       *
       * /streams:
       *  get:
       *    description: Get stream
       *    summary: Get stream
       *    produces:
       *      - application/json
       *    tags:
       *      - Stream
       *    parameters:
       *      - name: search
       *        in: query
       *        required: false
       *        type: string
       *      - name: limit
       *        in: query
       *        required: false
       *        type: integer
       *      - name: skip
       *        in: query
       *        required: false
       *        type: integer
       *      - name: orderBy
       *        in: query
       *        required: false
       *        type: string
       *      - name: isAscending
       *        in: query
       *        required: false
       *        type: boolean
       *      - name: isActive
       *        in: query
       *        required: false
       *        type: boolean
       *    responses:
       *      200:
       *        schema:
       *         $ref: '#/definitions/StreamsResponse'
       *      401:
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       */
      [
        'get', '/api/v1/streams',
        this.authValidator.loggedOnly,
        this.streamValidator.validateGetStreams,
        this.getStreams.bind(this)
      ],
      /**
       * @swagger
       *
       * /populate-twitch-streams:
       *  get:
       *    description: Get Streams for users from Twitch
       *    summary: Get Streams for users from Twitch
       *    produces:
       *      - application/json
       *    tags:
       *      - Stream
       *    responses:
       *      200:
       *        schema:
       *         $ref: '#/definitions/SuccessEmptyResponse'
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
