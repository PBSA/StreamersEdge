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
   * Find user by network account id and create row if not exists
   * @param {String} network
   * @param account
   * @returns {Promise<UserModel>}
   */
  async getUserBySocialNetworkAccount(network, account) {
    const {id, email, picture} = account;

    let User = await this.userRepository.model.findOne({
      where: {
        [`${network}Id`]: id
      }
    });

    if (!User) {
      let emailIsUsed = await this.userRepository.model.findOne({where: {email}});

      if (emailIsUsed) {
        throw new Error('This email already is used');
      }

      User = await this.userRepository.create({
        [`${network}Id`]: id,
        avatar: picture,
        email
      });
    }

    return User;
  }

  /**
   * @param {UserModel} User
   * @returns {Promise<UserPublicObject>}
   */
  async getCleanUser(User) {
    return User.getPublic();
  }

  /**
   * @param {UserModel} User
   * @param updateObject
   * @returns {Promise<UserModel>}
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
   * @param {UserModel} User
   * @param name
   * @param activeKey
   * @param ownerKey
   * @returns {Promise<UserModel>}
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
