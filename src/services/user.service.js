const bcrypt = require('bcrypt');
const moment = require('moment');
const RestError = require('../errors/rest.error');
const invitationConstants = require('../constants/invitation');

class UserService {

  /**
   * @param {DbConnection} opts.dbConnection
   * @param {UserRepository} opts.userRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {VerificationTokenRepository} opts.verificationTokenRepository
   * @param {ResetTokenRepository} opts.resetTokenRepository
   * @param {WhitelistedUsersRepository} opts.whitelistedUsersRepository
   * @param {WhitelistedGamesRepository} opts.whitelistedGamesRepository
   * @param {MailService} opts.mailService
   * @param {PubgApiRepository} opts.pubgApiRepository
   * @param {TransactionRepository} opts.transactionRepository
   * @param {FileService} opts.fileService
   * @param {GoogleRepository} opts.googleRepository
   */
  constructor(opts) {
    this.dbConnection = opts.dbConnection;
    this.userRepository = opts.userRepository;
    this.transactionRepository = opts.transactionRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.verificationTokenRepository = opts.verificationTokenRepository;
    this.resetTokenRepository = opts.resetTokenRepository;
    this.whitelistedUsersRepository = opts.whitelistedUsersRepository;
    this.whitelistedGamesRepository = opts.whitelistedGamesRepository;
    this.mailService = opts.mailService;
    this.pubgApiRepository = opts.pubgApiRepository;
    this.googleRepository = opts.googleRepository;

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
   * @param {UserModel|null} LoggedUser
   * @returns {Promise<UserModel>}
   */
  async getUserBySocialNetworkAccount(network, account, LoggedUser = null) {

    const {id, email, picture, username, youtube} = account;

    let UserWithNetworkAccount = await this.userRepository.model.findOne({where: {[`${network}Id`]: id}});

    if (UserWithNetworkAccount && LoggedUser && LoggedUser.id !== UserWithNetworkAccount.id) {
      throw new Error('this account already connected to another profile');
    }

    if (LoggedUser) {
      return await this.connectSocialNetwork(network, account, LoggedUser);
    }

    if (UserWithNetworkAccount) {
      return UserWithNetworkAccount;
    }

    const emailIsUsed = email && await this.userRepository.model.count({where: {email}});
    const usernameIsUsed = username && await this.userRepository.model.count({where: {username}});

    return await this.userRepository.create({
      [`${network}Id`]: id,
      avatar: picture,
      email: emailIsUsed ? null : email,
      isEmailVerified: emailIsUsed ? null : true,
      username: usernameIsUsed ? null : username,
      twitchUserName: network === 'twitch' ? username : '',
      googleName: network === 'google' ? username : '',
      facebook: network === 'facebook' ? username : '',
      youtube
    });
  }

  async connectSocialNetwork(network, account, User) {
    const {id, email, picture, username, youtube} = account;

    if (User[`${network}Id`] === id) {
      return User;
    }

    const emailIsUsed = email && await this.userRepository.model.count({where: {email}});
    const usernameIsUsed = username && await this.userRepository.model.count({where: {username}});

    User[`${network}Id`] = id;

    switch(network) {
      case 'twitch': User.twitchUserName = username; 
        break;
      case 'google': User.googleName = username; 
        break;
      case 'facebook': User.facebook = username; 
        break;
      default: throw new RestError(`Unexpected Network ${network}`);
    }

    if (!User.email && !emailIsUsed) {
      User.email = email;
    }

    if (User.email === email) {
      User.isEmailVerified = true;
    }

    if (!User.username && !usernameIsUsed) {
      User.username = username;
    }

    if (!User.avatar) {
      User.avatar = picture;
    }

    if (!User.youtube) {
      User.youtube = youtube;
    }

    await User.save();
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
   * @param getClean
   * @returns {Promise<UserModel>}
   */
  async patchProfile(User, updateObject, getClean = true) {
    Object.keys(updateObject).forEach((field) => {
      User[field] = updateObject[field];
    });
    await User.save();
    return getClean ? this.getCleanUser(User) : User;
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

  async getUserTransactions(userId, skip, limit) {
    const transactions = await this.transactionRepository.searchTransactions(userId, limit, skip);
    return Promise.all(transactions.map(async (Tx) => Tx.getPublic()));
  }

  /**
   * Change notification status of user
   *
   * @param user
   * @param notifications
   * @returns {Promise<Array>}
   */
  async changeNotificationStatus(user, {notifications}) {
    const updatedNotification = await this.userRepository.updateNotification(user.id, notifications);

    if (!updatedNotification[0]) {
      throw new Error(this.errors.USER_NOT_FOUND);
    }

    return updatedNotification;

  }

  /**
   * Change invitation status of user
   *
   * @param user
   * @param status
   * @returns {Promise<Array>}
   */
  async changeInvitationStatus(user, status) {
    return await this.dbConnection.sequelize.transaction(async (tx) => {
      const updatedInvitation = await this.userRepository.updateInvitation(user.id, status.invitations);

      if (!updatedInvitation[0]) {
        throw new Error(this.errors.USER_NOT_FOUND);
      }

      switch (status.invitations) {
        case invitationConstants.invitationStatus.users: {
          const users = status.users.map((userId) => ({
            'toUser': user.id,
            'fromUser': userId
          }));
          await Promise.all([
            this.whitelistedUsersRepository.destroyByToUserId(user.id, tx),
            this.whitelistedUsersRepository.bulkCreateFromUsers(users, tx)
          ]);
          return updatedInvitation;
        }

        case invitationConstants.invitationStatus.games: {
          const games = status.games.map((game) => ({
            'toUser': user.id,
            'fromGame': game
          }));
          await Promise.all([
            this.whitelistedGamesRepository.destroyByToUserId(user.id, tx),
            this.whitelistedGamesRepository.bulkCreateFromGames(games, tx)
          ]);
          return updatedInvitation;
        }

        default:
          return updatedInvitation;
      }
    });
  }

  async getUserYoutubeLink(tokens) {
    return this.googleRepository.getYoutubeLink(tokens);
  }
}

module.exports = UserService;
