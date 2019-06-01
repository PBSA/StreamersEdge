const RestError = require('../errors/rest.error');

class FacebookService {

  /**
	 * @param {AppConfig} opts.config
	 * @param {FacebookRepository} opts.facebookRepository
	 */
  constructor(opts) {
    this.config = opts.config;
    this.facebookRepository = opts.facebookRepository;
  }

  async getAuthRedirectURL() {
    return this.facebookRepository.getAuthUrl();
  }

  async getUserByCode(code) {
    try {
      return await this.facebookRepository.getProfileByCode(code);
    } catch (e) {
      throw new RestError(e.message, 400);
    }
  }

}

module.exports = FacebookService;
