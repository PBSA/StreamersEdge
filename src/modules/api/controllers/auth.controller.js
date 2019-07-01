const ValidateError = require('../../../errors/validate.error');
const RestError = require('../../../errors/rest.error');

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
       * @api {post} /api/v1/auth/logout Logout
       * @apiName AuthLogout
       *
       * @apiGroup Auth
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {}
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "status": 200,
       *   "result": true
       * }
       */
      ['post', '/api/v1/auth/logout', this.authValidator.loggedOnly, this.logout.bind(this)],
      /**
       * @api {post} /api/v1/auth/sign-up Sign up
       * @apiName AuthSignUp
       *
       * @apiGroup Auth
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "email": "test@test.com",
       *   "username": "test",
       *   "password": "testtest",
       *   "repeatPassword": "testtest"
       * }
       */
      ['post', '/api/v1/auth/sign-up', this.authValidator.validateSignUp, this.signUp.bind(this)],
      /**
       * @api {get} /api/v1/auth/confirm-email/:token Confirm email
       * @apiName AuthConfirmEmail
       *
       * @apiGroup Auth
       * @apiVersion 0.1.0
       */
      [
        'get',
        '/api/v1/auth/confirm-email/:token',
        this.authValidator.validateConfirmEmail,
        this.confirmEmail.bind(this)
      ],
      /**
       * @api {post} /api/v1/auth/sign-in Sign in
       * @apiName AuthSignIn
       *
       * @apiGroup Auth
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "login": "test@test.com",
       *   "password": "testtest"
       * }
       */
      ['post', '/api/v1/auth/sign-in', this.authValidator.validateSignIn, this.signIn.bind(this)],
      /**
       * @api {post} /api/v1/auth/forgot-password Forgot password
       * @apiName ForgotPassword
       *
       * @apiGroup Auth
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "email": "test@test.com"
       * }
       */
      [
        'post',
        '/api/v1/auth/forgot-password',
        this.authValidator.validateForgotPassword,
        this.forgotPassword.bind(this)
      ],
      /**
       * @api {post} /api/v1/auth/reset-password Reset password
       * @apiName ResetPassword
       *
       * @apiGroup Auth
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "token": "fb7ce9c3913ed08a0dfd45d4bc",
       *   "password": "testpass",
       *   "repeatPassword": "testpass"
       * }
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
