const RestError = require('../../../errors/rest.error');

/**
 * @swagger
 *
 * definitions:
 *  ProfileCreatePeerplaysAccount:
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
 *  ProfileAvatar:
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
 *  ProfileResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            $ref: '#/definitions/User'
 */

class ProfileController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {ProfileValidator} opts.profileValidator
   * @param {UserService} opts.userService
   * @param {FileService} opts.fileService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.profileValidator = opts.profileValidator;
    this.userService = opts.userService;
    this.fileService = opts.fileService;
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
       * /profile:
       *  get:
       *    description: Get authorized user profile
       *    summary: Get authorized user profile
       *    produces:
       *      - application/json
       *    tags:
       *      - Profile
       *    responses:
       *      200:
       *        description: Profile response
       *        schema:
       *         $ref: '#/definitions/UserResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'get', '/api/v1/profile',
        this.authValidator.loggedOnly,
        this.getProfile.bind(this)
      ],
      /**
       * @swagger
       *
       * /profile:
       *  patch:
       *    description: Update authorized user profile
       *    summary: Update authorized user profile
       *    produces:
       *      - application/json
       *    tags:
       *      - Profile
       *    parameters:
       *      - name: profile
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/UserNew'
       *    responses:
       *      200:
       *        description: Profile response
       *        schema:
       *          $ref: '#/definitions/ProfileResponse'
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
        'patch', '/api/v1/profile',
        this.authValidator.loggedOnly,
        this.profileValidator.patchProfile,
        this.patchProfile.bind(this)
      ],
      /**
       * @swagger
       *
       * /profile/peerplays/create-account:
       *  post:
       *    description: Create peerplays account for authorized user
       *    summary: Create peerplays account for authorized user
       *    produces:
       *      - application/json
       *    tags:
       *      - Profile
       *    parameters:
       *      - name: ProfileCreatePeerplaysAccount
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/ProfileCreatePeerplaysAccount'
       *    responses:
       *      200:
       *        description: Create-account response
       *        schema:
       *          $ref: '#/definitions/ProfileResponse'
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
        'post', '/api/v1/profile/peerplays/create-account',
        this.authValidator.loggedOnly,
        this.profileValidator.createPeerplaysAccount,
        this.createPeerplaysAccount.bind(this)
      ],
      /**
       * @swagger
       *
       * /profile/avatar:
       *  post:
       *    description: Add or change account avatar
       *    summary: Add or change account avatar
       *    produces:
       *      - application/json
       *    tags:
       *      - Profile
       *    parameters:
       *      - name: file
       *        in:  body
       *        required: true
       *        schema:
       *          type: object
       *          required:
       *            - file
       *          properties:
       *            file:
       *              type: string
       *              format: binary
       *    responses:
       *      200:
       *        description: Profile avatar response
       *        schema:
       *          $ref: '#/definitions/ProfileResponse'
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
        'post', '/api/v1/profile/avatar',
        this.authValidator.loggedOnly,
        this.uploadAvatar.bind(this)
      ],
      /**
       * @swagger
       *
       * /profile/avatar:
       *  delete:
       *    description: Delete profile avatar
       *    summary: Delete profile avatar
       *    produces:
       *      - application/json
       *    tags:
       *      - Profile
       *    responses:
       *      200:
       *        description: Delete profile avatar response
       *        schema:
       *          $ref: '#/definitions/ProfileResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'delete', '/api/v1/profile/avatar',
        this.authValidator.loggedOnly,
        this.deleteAvatar.bind(this)
      ]
    ];
  }

  async getProfile(user) {
    return this.userService.getCleanUser(user);
  }

  async patchProfile(user, updateData) {
    return this.userService.patchProfile(user, updateData);
  }

  async createPeerplaysAccount(user, data) {
    try {
      return await this.userService.createPeerplaysAccount(user, data);
    } catch (e) {
      throw new RestError(e.message, 400, e.details);
    }
  }

  async uploadAvatar(user, data, req, res) {
    try {
      const location = await this.fileService.saveImage(req, res);
      return await this.userService.patchProfile(user, {avatar: location});
    } catch (err) {
      switch (err.message) {
        case this.fileService.errors.FILE_NOT_FOUND:
          throw new RestError('', 400, {image: [{message: 'File not found'}]});
        case this.fileService.errors.INVALID_IMAGE_FORMAT:
          throw new RestError('', 400, {format: [{message: 'Invalid file format'}]});
        case this.fileService.errors.FILE_TOO_LARGE:
          throw new RestError('', 400, {size: [{message: 'Image should be less 1 MB'}]});
        default:
          throw err;
      }
    }
  }

  async deleteAvatar(user) {
    return await this.userService.patchProfile(user, {avatar: null});
  }

}

module.exports = ProfileController;
