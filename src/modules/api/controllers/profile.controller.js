const RestError = require('../../../errors/rest.error');
const ValidateError = require('./../../../errors/validate.error');

/**
 * @swagger
 *
 * definitions:
 *  LeagueOfLegendsRealms:
 *    type: array
 *    items:
 *      type: string
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
   * @param {LeagueOfLegendsConnection} opts.leagueOfLegendsConnection
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.profileValidator = opts.profileValidator;
    this.userService = opts.userService;
    this.fileService = opts.fileService;
    this.leagueOfLegendsConnection = opts.leagueOfLegendsConnection;
    this.config = opts.config;
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
       * /profile/league-of-legends/realms:
       *  get:
       *    description: Get a list of available LoL realms
       *    produces:
       *      - application/json
       *    tags:
       *      - Profile
       *    responses:
       *      200:
       *        description: Realms
       *        schema:
       *          $ref: '#/definitions/LeagueOfLegendsRealms'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'get', '/api/v1/profile/league-of-legends/realms',
        this.authValidator.loggedOnly,
        this.getLeagueOfLegendsRealms.bind(this)
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
       *      - in: formData
       *        name: file
       *        type: file
       *        description: The file to upload.
       *    consumes:
       *      - multipart/form-data
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
      ],
      /**
       * @swagger
       *
       * /profile/change-email/{token}:
       *  get:
       *    description: Change user email
       *    summary: Change user email
       *    produces:
       *      - application/json
       *    tags:
       *      - Profile
       *    parameters:
       *      - name: token
       *        in:  path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: Change user email response
       *        schema:
       *          $ref: '#/definitions/ProfileResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       */
      [
        'get', '/api/v1/profile/change-email/:token',
        this.authValidator.validateConfirmEmail,
        this.changeEmail.bind(this)
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

  async deleteAvatarFromCDN(user) {
    if (user.avatar && user.avatar.startsWith(this.config.cdnUrl)) {
      await this.fileService.delete(user.avatar.slice(this.config.cdnUrl.length));
    }
  }

  async uploadAvatar(user, data, req, res) {
    try {
      const location = await this.fileService.saveImage(req, res);
      const patchedUser = await this.userService.patchProfile(user, {avatar: location});
      await this.deleteAvatarFromCDN(user);

      return patchedUser;
    } catch (err) {
      this.handleError(err);
    }
  }

  async deleteAvatar(user) {
    await this.deleteAvatarFromCDN(user);
    return await this.userService.patchProfile(user, {avatar: null});
  }

  handleError(err) {
    if (err.message === this.fileService.errors.FILE_NOT_FOUND) {
      throw new RestError('', 400, {image: [{message: 'File not found'}]});
    } else if (err.message === this.fileService.errors.INVALID_IMAGE_FORMAT) {
      throw new RestError('', 400, {format: [{message: 'Invalid file format'}]});
    } else if (err.message === this.fileService.errors.IMAGE_STRING_TOO_LONG) {
      throw new RestError('', 400, {image: [{message: 'Image String too long'}]});
    } else if (err.message === this.fileService.errors.INVALID_REQUEST) {
      throw new RestError('', 400, {image: [{message: 'Invalid Request'}]});
    } else if (err.message.toLowerCase().startsWith('invalid url')) {
      throw new RestError('', 400, {format: [{message: 'Invalid URL'}]});
    } else if (err.message === this.fileService.errors.FILE_TOO_LARGE) {
      throw new RestError('', 400, {image: [{message: 'File too large, Image file restrictions: JPEG or PNG and < 1MB'}]});
    } else {
      throw err;
    }
  }

  async changeEmail(user, ActiveToken) {
    try {
      if (user && user.id !== ActiveToken.userId) {
        throw new ValidateError(401, 'unauthorized');
      }

      return await this.userService.changeEmail(ActiveToken);
    } catch (err) {
      this.handleError(err);
    }
  }

  async getLeagueOfLegendsRealms() {
    return this.leagueOfLegendsConnection.getRealms();
  }
}

module.exports = ProfileController;
