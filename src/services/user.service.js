const RestError = require('../errors/rest.error');

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
   * @returns {Promise<UserModel>}
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
   * @returns {Promise<UserModel>}
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
    } catch (details) {
      throw new RestError('Request error', 400, details);
    }

    User.peerplaysAccountName = name;
    await User.save();
    return this.getCleanUser(User);
  }

}

module.exports = UserService;
