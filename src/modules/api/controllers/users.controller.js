const RestError = require('../../../errors/rest.error');

class UsersController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {UserValidator} opts.userValidator
   * @param {UserService} opts.userService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.userService = opts.userService;
    this.userValidator = opts.userValidator;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes() {
    return [
      /**
       * @api {get} /api/v1/users/:id Get user by id
       * @apiName UserGet
       * @apiGroup Users
       * @apiVersion 0.1.0
       * @apiParam {String} id  User id
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
        'get', '/api/v1/users/:id',
        this.authValidator.loggedOnly,
        this.userValidator.getUser,
        this.getUser.bind(this)
      ],
      /**
       * @api {get} /api/v1/users Get users list
       * @apiName UsersGet
       * @apiGroup Users
       * @apiVersion 0.1.0
       * @apiParam {String} [search] Filter by PeerPlays Account Name
       * @apiParam {Number} limit Limit of rows
       * @apiParam {Number} [skip] Number of rows to skip
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
        'get', '/api/v1/users',
        this.authValidator.loggedOnly,
        this.userValidator.getUsers,
        this.getUsers.bind(this)
      ]
    ];
  }

  async getUser(user, id) {
    try {
      return await this.userService.getUser(id);
    } catch (e) {
      throw new RestError(e.message, 404);
    }
  }

  async getUsers(user, {search, limit, skip}) {
    skip = skip || 0;
    return await this.userService.searchUsers(search, limit, skip);
  }

}

module.exports = UsersController;
