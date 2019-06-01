class UserService {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {FileService} opts.fileService
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.fileService = opts.fileService;
  }

  /**
   * Find user by twitch account and create row if not exists
   * @param account
   * @returns {Promise<UserDocument>}
   */
  async getUserByTwitchAccount(account) {
    const {
      name, _id, email, logo
    } = account;
    let User = await this.userRepository.findOne({
      twitchId: _id
    });

    if (!User) {
      User = await this.userRepository.create({
        username: name,
        twitchId: _id,
        email,
        avatar: logo
      });
    }

    return User;
  }

  /**
   * Find user by network account id and create row if not exists
   * @param {String} network
   * @param account
   * @returns {Promise<UserDocument>}
   */
  async getUserBySocialNetworkAccount(network, account) {
    const {
      name, id, picture, email
    } = account;
    let User = await this.userRepository.findOne({
      [`${network}Id`]: id
    });

    if (!User) {
      User = await this.userRepository.create({
        username: name,
        [`${network}Id`]: id,
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
    const avatar = User.avatar ? User.avatar : null;

    return {
      id: User._id,
      username: User.username,
      youtube: User.youtube,
      facebook: User.facebook,
      peerplaysAccountName: User.peerplaysAccountName,
      bitcoinAddress: User.bitcoinAddress,
      avatar: avatar && !avatar.match(/^http/)
        ? this.fileService.getImage(User.avatar, 'avatar')
        : avatar
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

  async updateAvatar(User, filename) {
    User.avatar = filename;
    await User.save();
    return User;
  }

}

module.exports = UserService;
