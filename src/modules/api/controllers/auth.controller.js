const ValidateError = require('../../../errors/validate.error');
const RestError = require('../../../errors/rest.error');

/**
 * @swagger
 *
 * definitions:
 *  AuthSignUpUser:
 *    type: object
 *    required:
 *      - email
 *      - username
 *      - password
 *      - repeatPassword
 *    properties:
 *      email:
 *        type: string
 *        format: email
 *      username:
 *        type: string
 *      password:
 *        type: string
 *        format: password
 *      repeatPassword:
 *        type: string
 *        format: password
 *  AuthSignInUser:
 *    type: object
 *    required:
 *      - login
 *      - password
 *    properties:
 *      login:
 *        type: string
 *      password:
 *        type: string
 *        format: password
 *  AuthForgotPassword:
 *    type: object
 *    required:
 *      - email
 *    properties:
 *      email:
 *        type: string
 *        format: email
 *  AuthResetPassword:
 *    type: object
 *    required:
 *      - token
 *      - password
 *      - repeatPassword
 *    properties:
 *      token:
 *        type: string
 *      password:
 *        type: string
 *        format: password
 *      repeatPassword:
 *        type: string
 *        format: password
 *  UserResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            $ref: '#/definitions/User'
 *  UsersResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            type: array
 *            items:
 *              $ref: '#/definitions/User'
 */

class AuthController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {UserService} opts.userService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.userService = opts.userService;
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
       * /auth/logout:
       *  post:
       *    description: Logout
       *    produces:
       *      - application/json
       *    tags:
       *      - Auth
       *    responses:
       *      200:
       *        description: Logout response
       *        schema:
       *          $ref: '#/definitions/SuccessEmptyResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *
       */
      ['post', '/api/v1/auth/logout', this.authValidator.loggedOnly, this.logout.bind(this)],
      /**
       * @swagger
       *
       * /auth/sign-up:
       *  post:
       *    description: Sign up
       *    produces:
       *      - application/json
       *    tags:
       *      - Auth
       *    parameters:
       *      - name: user
       *        description: User object
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/AuthSignUpUser'
       *    responses:
       *      200:
       *        description: User response
       *        schema:
       *          $ref: '#/definitions/UserResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       */
      ['post', '/api/v1/auth/sign-up', this.authValidator.validateSignUp, this.signUp.bind(this)],
      /**
       * @swagger
       *
       * /auth/confirm-email/{token}:
       *  post:
       *    description: Confirm email
       *    produces:
       *      - application/json
       *    tags:
       *      - Auth
       *    parameters:
       *      - name: token
       *        in:  path
       *        required: true
       *        type: string
       *    responses:
       *      200:
       *        description: Confirm-email response
       *        schema:
       *         $ref: '#/definitions/SuccessEmptyResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       */
      [
        'get',
        '/api/v1/auth/confirm-email/:token',
        this.authValidator.validateConfirmEmail,
        this.confirmEmail.bind(this)
      ],
      /**
       * @swagger
       *
       * /auth/sign-in:
       *  post:
       *    description: Sign in
       *    produces:
       *      - application/json
       *    tags:
       *      - Auth
       *    parameters:
       *      - name: token
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/AuthSignInUser'
       *    responses:
       *      200:
       *        description: Sign in response
       *        schema:
       *          $ref: '#/definitions/UserResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       */
      ['post', '/api/v1/auth/sign-in', this.authValidator.validateSignIn, this.signIn.bind(this)],
      /**
       * @swagger
       *
       * /auth/forgot-password:
       *  post:
       *    description: Forgot password
       *    produces:
       *      - application/json
       *    tags:
       *      - Auth
       *    parameters:
       *      - name: token
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/AuthForgotPassword'
       *    responses:
       *      200:
       *        description: Forgot-password response
       *        schema:
       *         $ref: '#/definitions/SuccessEmptyResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
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
       *      429:
       *        description: Error too many requests
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 429
       *            error:
       *              type: string
       *              example: Too many requests
       */
      [
        'post',
        '/api/v1/auth/forgot-password',
        this.authValidator.validateForgotPassword,
        this.forgotPassword.bind(this)
      ],
      /**
       * @swagger
       *
       * /auth/reset-password:
       *  post:
       *    description: Forgot password
       *    produces:
       *      - application/json
       *    tags:
       *      - Auth
       *    parameters:
       *      - name: token
       *        in:  body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/AuthResetPassword'
       *    responses:
       *      200:
       *        description: Reset-password response
       *        schema:
       *         $ref: '#/definitions/SuccessEmptyResponse'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *      404:
       *        description: Error token not found
       *        schema:
       *          properties:
       *            status:
       *              type: number
       *              example: 404
       *            error:
       *              type: string
       *              example: Token not found
       */
      [
        'post',
        '/api/v1/auth/reset-password',
        this.authValidator.validateResetPassword,
        this.resetPassword.bind(this)
      ]
    ];
  }

  async logout(user, data, req) {
    req.logout();
    return true;
  }

  async signUp(user, {email, password, username}) {
    return this.userService.signUpWithPassword(email, username, password);
  }

  async confirmEmail(user, ActiveToken) {
    if (user && user.id !== ActiveToken.userId) {
      throw new ValidateError(401, 'unauthorized');
    }

    await this.userService.confirmEmail(ActiveToken);
    return true;
  }

  async signIn(_, {login, password}, req) {
    let user;

    try {
      user = await this.userService.getSignInUser(login, password);
    } catch (e) {
      throw new ValidateError(400, 'Invalid email/username or password');
    }

    await new Promise((success) => req.login(user, () => success()));
    return user;
  }

  async forgotPassword(_, email) {
    try {
      await this.userService.sendResetPasswordEmail(email);
    } catch (e) {
      switch (e.message) {
        case this.userService.errors.USER_NOT_FOUND:
          throw new RestError('User not found', 404);
        case this.userService.errors.TOO_MANY_REQUESTS:
          throw new RestError('Too many requests', 429);
        default:
          throw new RestError('Server side error', 500);
      }
    }

    return true;
  }

  async resetPassword(_, {ResetToken, password}) {
    await this.userService.resetPassword(ResetToken.user, password);
    await ResetToken.deactivate();

    return true;
  }

}

module.exports = AuthController;
