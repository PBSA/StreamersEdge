class UserService {

	/**
	 * @param {UserRepository} opts.userRepository
	 */
	constructor(opts) {
		this.userRepository = opts.userRepository;
	}

	/**
	 * Find user by twitch account and create row if not exists
	 * @param account
	 * @returns {Promise<UserDocument>}
	 */
	async getUserByTwitchAccount(account) {
		const { name, _id, email } = account;
		let User = await this.userRepository.findOne({
			twitchId: _id,
		});
		if (!User) {
			User = await this.userRepository.create({
				twitchUsername: name,
				twitchId: _id,
				twitchEmail: email,
			});
		}
		return User;
	}

	/**
	 * @param {UserDocument} User
	 * @returns {Promise<{}>}
	 */
	async getCleanUser(User) {
		return {
			id: User._id,
			twitchUsername: User.twitchUsername,
			youtube: User.youtube,
			facebook: User.facebook,
			peerplaysAccountName: User.peerplaysAccountName,
			bitcoinAddress: User.bitcoinAddress,
		};
	}

}

module.exports = UserService;
