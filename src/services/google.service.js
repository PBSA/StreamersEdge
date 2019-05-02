
class GoogleService {

	/**
	 * @param {AppConfig} opts.config
	 * @param {GoogleRepository} opts.googleRepository
	 */
	constructor(opts) {
		this.config = opts.config;
		this.googleRepository = opts.googleRepository;
	}

	async getAuthRedirectURL() {
		return this.googleRepository.getAuthUrl();
	}

	async getUserByCode(code) {
		return this.googleRepository.getProfileByCode(code);
	}

}

module.exports = GoogleService;
