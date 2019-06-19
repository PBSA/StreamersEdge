const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const moment = require('moment');
const RestError = require('../errors/rest.error');

class UserService {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {VerificationTokenRepository} opts.verificationTokenRepository
   * @param {ResetTokenRepository} opts.resetTokenRepository
   * @param {MailService} opts.mailService
   * @param {FileService} opts.fileService
   */
  constructor(opts) {
    this.userRepository = opts.userRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.verificationTokenRepository = opts.verificationTokenRepository;
    this.resetTokenRepository = opts.resetTokenRepository;
    this.mailService = opts.mailService;
    this.fileService = opts.fileService;

    this.errors = {
      USER_NOT_FOUND: 'USER_NOT_FOUND',
      TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS'
    };

    this.RESET_TOKEN_TIME_INTERVAL = 300;
  }

  /**
   * Find user by network account id and create row if not exists
   * @param {String} network
   * @param account
   * @returns {Promise<UserModel>}
   */
  async getUserBySocialNetworkAccount(network, account) {
    const {id, email, picture, username} = account;

    let User = await this.userRepository.model.findOne({
      where: {
        [`${network}Id`]: id
      }
    });

    if (!User) {
      const usedLogin = await this.userRepository.model.findAll({
        where: {[Sequelize.Op.or]: [{email}, {username}]}
      });

      const emailIsUsed = usedLogin.find((row) => row.email === email);
      const usernameIsUsed = usedLogin.find((row) => row.username === username);

      User = await this.userRepository.create({
        [`${network}Id`]: id,
        avatar: picture,
        email: emailIsUsed ? null : email,
        isEmailVerified: emailIsUsed ? null : true,
        username: usernameIsUsed ? null : username
      });
    }

    return User;
  }

  /**
   * @param {UserModel} User
   * @returns {Promise<UserPublicObject>}
   */
  async getCleanUser(User) {
    const object = User.getPublic();
    const avatar = object.avatar ? object.avatar : '';
    object.avatar = avatar && !avatar.match(/^http/)
      ? this.fileService.getImage(User.avatar, 'avatar')
      : avatar;
    return object;
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

  /**
   * Get a list of users corresponding to the specified parameters
   *
   * @param search
   * @param limit
   * @param skip
   * @returns {Promise<[UserModel]>}
   */
  async searchUsers(search, limit, skip) {
    const users = await this.userRepository.searchUsers(search, limit, skip);
    return Promise.all(users.map(async (User) => this.getCleanUser(User)));
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

  async sendResetPasswordEmail(email) {
    const User = await this.userRepository.model.findOne({
      where: {email},
      include: [{
        model: this.resetTokenRepository.model
      }],
      order: [[{model: this.resetTokenRepository.model}, 'createdAt']]
    });

    if (!User) {
      throw new Error(this.errors.USER_NOT_FOUND);
    }

    if (User['reset-tokens'].length) {
      const lastReset = User['reset-tokens'][User['reset-tokens'].length - 1];

      if (moment().diff(lastReset.createdAt, 'second') < this.RESET_TOKEN_TIME_INTERVAL) {
        throw new Error(this.errors.TOO_MANY_REQUESTS);
      }

      await Promise.all(User['reset-tokens'].map(async (resetToken) => {
        resetToken.isActive = false;
        return await resetToken.save();
      }));
    }

    const {token} = await this.resetTokenRepository.createToken(User.id);

    await this.mailService.sendMailResetPassword(email, token);

    return true;
  }

  async resetPassword(User, password) {
    User.password = await bcrypt.hash(password, 10);
    await User.save();

    return true;
  }

  async updateAvatar(User, filename) {
    User.avatar = filename;
    await User.save();
    return User;
  }

}

module.exports = UserService;
