/* eslint-disable max-len */
class AuthController {

  /**
	 * @param {AuthValidator} opts.authValidator
	 */
  constructor(opts) {
    this.authValidator = opts.authValidator;
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
      ['post', '/api/v1/auth/logout', this.authValidator.loggedOnly, this.logout.bind(this)]
    ];
  }

  async logout(user, data, req) {
    req.logout();
    return true;
  }

}

module.exports = AuthController;
