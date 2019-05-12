const RestError = require('../../../errors/rest.error');

/* eslint-disable max-len */
class GoogleController {

  /**
	 * @param {AuthValidator} opts.authValidator
	 * @param {GoogleService} opts.googleService
	 * @param {UserService} opts.userService
	 */
  constructor(opts) {
    this.authValidator = opts.authValidator;
    this.googleService = opts.googleService;
    this.userService = opts.userService;
  }

  /**
	 * Array of routes processed by this controller
	 * @returns {*[]}
	 */
  getRoutes() {
    return [
      /**
			 * @api {get} /api/v1/auth/google/redirect-url Get redirect url for auth with Google
			 * @apiName GetGoogleRedirectURL
			 * @apiDescription You should use this method for receiving urls for redirect.
			 * @apiGroup Auth
			 * @apiVersion 0.1.0
			 * @apiSuccessExample {json} Success-Response:
			 * HTTP/1.1 200 OK
			 * {
			 *   "result": "https://accounts.google.com/o/oauth2/auth?approval_prompt=...",
			 *   "status": 200
			 * }
			 */
      ['get', '/api/v1/auth/google/redirect-url', this.getRedirectUrl.bind(this)],
      /**
			 * @api {post} /api/v1/auth/google/code Auth with google code
			 * @apiName AuthWithGoogleCode
			 * @apiDescription After getting a code from google (google returns user to the redirect url with code),
			 * you should send this code to backend for finishing authentication process
			 * @apiGroup Auth
			 * @apiVersion 0.1.0
			 * @apiExample {json} Request-Example:
			 * {
			 *   "code": "334442ikjds--s0dff"
			 * }
			 * @apiUse AccountObjectResponse
			 */
      ['post', '/api/v1/auth/google/code', this.authValidator.validateAuthCode, this.authWithCode.bind(this)]
    ];
  }

  async getRedirectUrl() {
    return this.googleService.getAuthRedirectURL();
  }

  async authWithCode(user, code, req) {
    let User;

    try {
      User = await this.googleService.getUserByCode(code);
    } catch (e) {
      throw new RestError(e.message, 400);
    }

    User = await this.userService.getUserBySocialNetworkAccount('google', User);
    await new Promise((success) => req.login(User, () => success()));
    return this.userService.getCleanUser(User);
  }

}

module.exports = GoogleController;
