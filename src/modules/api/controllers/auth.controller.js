const ValidateError = require('../../../errors/validate.error');

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
       *   "password": "testtest"
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
      ['get', '/api/v1/auth/confirm-email/:token', this.authValidator.validateConfirmEmail, this.confirmEmail.bind(this)],
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
      ['post', '/api/v1/auth/sign-in', this.authValidator.validateSignIn, this.signIn.bind(this)]
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

}

module.exports = AuthController;
