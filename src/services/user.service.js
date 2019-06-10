const bcrypt = require('bcrypt');
const RestError = require('../errors/rest.error');

class UserService {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {VerificationTokenRepository} opts.verificationTokenRepository
   * @param {MailService} opts.mailService
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.verificationTokenRepository = opts.verificationTokenRepository;
    this.mailService = opts.mailService;
  }

  /**
   * Find user by twitch account and create row if not exists
   * @param account
   * @returns {Promise<UserModel>}
   */
  async getUserByTwitchAccount(account) {
    const {id, email} = account;

    let User = await this.userRepository.model.findOne({
      where: {
        twitchId: id
      }
    });

    if (!User) {
      let emailIsUsed = await this.userRepository.model.findOne({where: {email}});

      if (emailIsUsed) {
        throw new Error('This email already is used');
      }

      User = await this.userRepository.create({
        where: {
          twitchId: id
        },
        defaults: {
          email
        }
      });
    }

    return User;
  }

  /**
   * Find user by google account and create row if not exists
   * @param account
   * @returns {Promise<UserModel>}
   */
  async getUserByGoogleAccount(account) {
    const {
      id, picture, email
    } = account;

    let User = await this.userRepository.model.findOne({
      where: {
        googleId: id
      }
    });

    if (!User) {
      let emailIsUsed = await this.userRepository.model.findOne({where: {email}});

      if (emailIsUsed) {
        throw new Error('This email already is used');
      }

      User = await this.userRepository.create({
        where: {
          googleId: id
        },
        defaults: {
          avatar: picture,
          email
        }
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
    } catch (details) {
      throw new RestError('Request error', 400, details);
    }

    User.peerplaysAccountName = name;
    await User.save();
    return this.getCleanUser(User);
  }

  async signUpWithPassword(email, username, password) {
    password = await bcrypt.hash(password, 10);
    const User = await this.userRepository.model.create({
      email, username, password
    });
    const {token} = await this.verificationTokenRepository.createToken(User.id);

    await this.mailService.sendMailAfterRegistration(email, token);

    return this.getCleanUser(User);
  }

  async confirmEmail(ActiveToken) {
    const User = await this.userRepository.findByPk(ActiveToken.userId);
    User.isEmailVerified = true;
    await User.save();
    ActiveToken.isActive = false;
    await ActiveToken.save();
  }

  async getSignInUser(login, password) {
    const User = await this.userRepository.getByLogin(login);

    if (!User) {
      throw new Error('User not found');
    }

    if (!await bcrypt.compare(password, User.password)) {
      throw new Error('Invalid password');
    }

    return this.getCleanUser(User);
  }

}

module.exports = UserService;
