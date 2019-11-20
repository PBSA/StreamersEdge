const RestError = require('../../../errors/rest.error');

/**
 * @swagger
 *
 * definitions:
 *  UsersChangeNotificationsStatus:
 *    type: object
 *    required:
 *      - notifications
 *    properties:
 *      notifications:
 *        type: boolean
 *  UsersChangeInvitationsStatus:
 *    type: object
 *    required:
 *      - invitations
 *      - minBounty
 *    properties:
 *      invitations:
 *        type: string
 *      users:
 *        type: array
 *        items:
 *          type: integer
 *      games:
 *        type: array
 *        description: Names of games from which user can accepts invitations
 *        items:
 *          type: string
 *      minBounty:
 *        type: number
 *        description: Minimum bounty allowed for invitations
 *
 */

class UsersController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {UserValidator} opts.userValidator
   * @param {UserService} opts.userService
   * @param {WebPushConnection} opts.webPushConnection
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.userService = opts.userService;
    this.userValidator = opts.userValidator;
    this.webPushConnection = opts.webPushConnection;
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
       * /users/{id}:
       *  get:
       *    description: Get user by id
       *    produces:
       *      - application/json
       *    tags:
       *      - User
       *    parameters:
       *      - name: id
       *        description: User id
       *        in: path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: User response
       *        schema:
       *          $ref: '#/definitions/UserResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      404:
       *        description: Error user not found
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 404
       *            error:
       *              type: string
       *              example: User not found
       */
      [
        'get', '/api/v1/users/:id',
        this.authValidator.loggedOnly,
        this.userValidator.getUser,
        this.getUser.bind(this)
      ],
      /**
       * @swagger
       *
       * /users:
       *  get:
       *    description: Get users list
       *    produces:
       *      - application/json
       *    tags:
       *      - User
       *    parameters:
       *      - name: search
       *        description: Filter by PeerPlays Account Name
       *        in: query
       *        required: false
       *        type: string
       *      - name: limit
       *        description: Limit of rows
       *        in: query
       *        required: true
       *        type: integer
       *      - name: skip
       *        description: Number of rows to skip
       *        in: query
       *        required: false
       *        type: integer
       *    responses:
       *      200:
       *        description: Users response
       *        schema:
       *          $ref: '#/definitions/UsersResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       */
      [
        'get', '/api/v1/users',
        this.authValidator.loggedOnly,
        this.userValidator.getUsers,
        this.getUsers.bind(this)
      ],
      /**
       * @swagger
       *
       * /users/setNotification:
       *  patch:
       *    description: Change notification status
       *    produces:
       *      - application/json
       *    tags:
       *      - User
       *    parameters:
       *      - name: notifications
       *        in: body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/UsersChangeNotificationsStatus'
       *    responses:
       *      200:
       *        description: Change result
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       */
      [
        'patch', '/api/v1/users/setNotification',
        this.authValidator.loggedOnly,
        this.userValidator.changeNotificationStatus,
        this.changeNotificationStatus.bind(this)
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


  async changeNotificationStatus(user, status) {
    try{
      return await this.userService.changeNotificationStatus(user, status);
    } catch (e) {
      if (e.message === this.userService.errors.NOTIFICATION_PREFERENCE_NOT_FOUND) {
        throw new RestError('', 400, {image: [{message: 'Notification Preference Required'}]});
      }
    }
  }

}

module.exports = UsersController;
