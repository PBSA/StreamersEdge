class UserService {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
  }

  /**
   * Find user by twitch account and create row if not exists
   * @param account
   * @returns {Promise<UserDocument>}
   */
  async getUserByTwitchAccount(account) {
    const {name, _id, email} = account;
    let User = await this.userRepository.findOne({
      twitchId: _id
    });

    if (!User) {
      User = await this.userRepository.create({
        username: name,
        twitchId: _id,
        email
      });
    }

    return User;
  }

  /**
   * Find user by google account and create row if not exists
   * @param account
   * @returns {Promise<UserDocument>}
   */
  async getUserByGoogleAccount(account) {
    const {
      name, id, picture, email
    } = account;
    let User = await this.userRepository.findOne({
      googleId: id
    });

    if (!User) {
      User = await this.userRepository.create({
        username: name,
        googleId: id,
        avatar: picture,
        email
      });
    }

    return User;
  }

  /**
   * @param {UserDocument} User
   * @returns {Promise<UserObject>}
   */
  async getCleanUser(User) {
    return {
      id: User._id,
      username: User.username,
      youtube: User.youtube,
      facebook: User.facebook,
      peerplaysAccountName: User.peerplaysAccountName,
      bitcoinAddress: User.bitcoinAddress
    };
  }

  /**
   * @param {UserDocument} User
   * @param updateObject
   * @returns {Promise<UserObject>}
   */
  async patchProfile(User, updateObject) {
    Object.keys(updateObject).forEach((field) => {
      User[field] = updateObject[field];
    });
    await User.save();
    return this.getCleanUser(User);
  }

  async getUser(id) {
    const User = await this.userRepository.findById(id);

    if (!User) {
      throw new Error('User not found');
    }

    return this.getCleanUser(User);
  }

  /**
   * @param {UserDocument} User
   * @param name
   * @param activeKey
   * @param ownerKey
   * @returns {Promise<UserObject>}
   */
  async createPeerplaysAccount(User, {name, activeKey, ownerKey}) {
    try {
      await this.peerplaysRepository.createPeerplaysAccount(name, ownerKey, activeKey);
    } catch (e) {
      throw new Error(e.message);
    }

    User.peerplaysAccountName = name;
    await User.save();
    return this.getCleanUser(User);
  }

  /**
   * Get a list of users corresponding to the specified parameters
   *
   * @param search
   * @param limit
   * @param skip
   * @returns {Promise<[UserObject]>}
   */
  async searchUsers(search, limit, skip) {
    const filter = search ? {
      peerplaysAccountName: {
        $regex: new RegExp(search.replace(/[.]/g, '\\$&'))
      }
    } : null;
    const users = await this.userRepository.find(filter, null, {limit, skip});
    return Promise.all(users.map(async (User) => this.getCleanUser(User)));
  }

}

module.exports = UserService;
