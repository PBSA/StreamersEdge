const RestError = require('../../../errors/rest.error');

class FacebookController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {FacebookService} opts.facebookService
   * @param {UserService} opts.userService
   */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.facebookService = opts.facebookService;
    this.userService = opts.userService;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   *
   */
  getRoutes() {
    return [
      /**
       * @api {get} /api/v1/auth/facebook/redirect-url Get redirect url for auth with Facebook
       * @apiName GetFacebookRedirectURL
       * @apiDescription You should use this method for receiving urls for redirect.
       * @apiGroup Auth
       * @apiVersion 0.1.0
       * @apiSuccessExample {json} Success-Response:
       * HTTP/1.1 200 OK
       * {
       *   "result": "https://www.facebook.com/v2.0/dialog/oauth?client_id=...&redirect_uri=...&scope=email",
       *   "status": 200
       * }
       */
      ['get', '/api/v1/auth/facebook/redirect-url', this.getRedirectUrl.bind(this)],
      /**
       * @api {post} /api/v1/auth/facebook/code Auth with facebook code
       * @apiName AuthWithFacebookCode
       * @apiDescription After getting a code from facebook (facebook returns user to the redirect url with code),
       * you should send this code to backend for finishing authentication process
       * @apiGroup Auth
       * @apiVersion 0.1.0
       * @apiExample {json} Request-Example:
       * {
       *   "code": "334442ikjds--s0dff"
       * }
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
      ['post', '/api/v1/auth/facebook/code', this.authValidator.validateAuthCode, this.authWithCode.bind(this)]
    ];
  }

  async getRedirectUrl() {
    return this.facebookService.getAuthRedirectURL();
  }

  async authWithCode(user, code, req) {
    let User;

    try {
      User = await this.facebookService.getUserByCode(code);
    } catch (e) {
      throw new RestError(e.message, 400);
    }

    User = await this.userService.getUserBySocialNetworkAccount('facebook', User);
    await new Promise((success) => req.login(User, () => success()));
    return this.userService.getCleanUser(User);
  }

}

module.exports = FacebookController;
