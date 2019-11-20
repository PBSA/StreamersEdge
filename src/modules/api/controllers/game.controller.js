/**
 * @swagger
 *
 * definitions:
 *  GameResponse:
 *    type: object
 *    properties:
 *      status:
 *        type: number
 *        example: 200
 *      result:
 *        type: object
 *        properties:
 *          resultPlace:
 *            type: string
 *            example: "resultPlace"
 *          winTime:
 *            type: string
 *            example: "winTime"
 *          frags:
 *            type: string
 *            example: "frags"
 */

class GameController {

  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.gameService = opts.gameService;
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
       * /game/stats:
       *  get:
       *    description: Get game paramTypes data
       *    produces:
       *      - application/json
       *    tags:
       *      - Game
       *    responses:
       *      200:
       *        description: Game response
       *        schema:
       *          $ref: '#/definitions/GameResponse'
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
        'get', '/api/v1/game/stats',
        this.authValidator.loggedOnly,
        this.getGameParamTypes.bind(this)
      ]
    ];
  }

  async getGameParamTypes(){
    return this.gameService.getGameParamData();
  }

}

module.exports = GameController;
