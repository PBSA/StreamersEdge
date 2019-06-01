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
    const {name, id, email} = account;
    const [User] = await this.userRepository.findOrCreate({
      where: {
        twitchId: id
      },
      defaults: {
        username: name,
        email
      }
    });

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

    const [User] = await this.userRepository.findOrCreate({
      where: {
        googleId: id
      },
      defaults: {
        username: name,
        avatar: picture,
        email
      }
    });

    return User;
  }

  /**
   * @param {UserDocument} User
   * @returns {Promise<UserObject>}
   */
  async getCleanUser(User) {
    return {
      id: User.id,
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
    const User = await this.userRepository.findByPk(id);

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

}

module.exports = UserService;
