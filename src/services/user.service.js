
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const moment = require('moment');
const BigNumber = require('bignumber.js');
const {Login} = require('peerplaysjs-lib');
const RestError = require('../errors/rest.error');
const {types: txTypes} = require('../constants/transaction');
const {userType} = require('../constants/profile');
const PeerplaysNameExistsError = require('./../errors/peerplays-name-exists.error');
const logger = require('log4js').getLogger('user.service');
const profileConstants = require('../constants/profile');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

class UserService {

  /**
     * @param {DbConnection} opts.dbConnection
     * @param {UserRepository} opts.userRepository
     * @param {PeerplaysRepository} opts.peerplaysRepository
     * @param {VerificationTokenRepository} opts.verificationTokenRepository
     * @param {ResetTokenRepository} opts.resetTokenRepository
     * @param {MailService} opts.mailService
     * @param {TransactionRepository} opts.transactionRepository
     * @param {FileService} opts.fileService
     * @param {GoogleRepository} opts.googleRepository
     * @param {PaypalRedemptionRepository} opts.paypalRedemptionRepository
     * @param {challengeRepository} opts.challengeRepository
     */
  constructor(opts) {
    this.config = opts.config;
    this.dbConnection = opts.dbConnection;
    this.userRepository = opts.userRepository;
    this.transactionRepository = opts.transactionRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.peerplaysConnection = opts.peerplaysConnection;
    this.verificationTokenRepository = opts.verificationTokenRepository;
    this.resetTokenRepository = opts.resetTokenRepository;
    this.mailService = opts.mailService;
    this.fileService = opts.fileService;
    this.googleRepository = opts.googleRepository;
    this.paypalRedemptionRepository = opts.paypalRedemptionRepository;
    this.pubgApiRepository = opts.pubgApiRepository;
    this.challengeRepository = opts.challengeRepository;

    this.errors = {
      USER_NOT_FOUND: 'USER_NOT_FOUND',
      NOTIFICATION_PREFERENCE_NOT_FOUND: 'NOTIFICATION_PREFERENCE_NOT_FOUND',
      TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
      PEERPLAYS_ACCOUNT_MISSING: 'PEERPLAYS_ACCOUNT_MISSING',
      INVALID_RECEIVER_ACCOUNT: 'INVALID_RECEIVER_ACCOUNT',
      INVALID_PPY_AMOUNT: 'INVALID_PPY_AMOUNT'
    };

    this.RESET_TOKEN_TIME_INTERVAL = 10;
  }

  /**
   *
   * @param {String} username
   * @param {Number} numRetries
   */
  async createUserForSocialNetwork(username, numRetries = 0) {
    const MAX_RETRIES = 5;

    if (numRetries >= MAX_RETRIES) {
      throw new Error('failed to create user, too many retries');
    }

    const randomString = `${Math.floor(Math.min(1000 + Math.random() * 9000, 9999))}`; // random 4 digit number

    try {
      return await this.userRepository.model.create({
        username: numRetries === 0 ? username : `${username}-${randomString}`
      });
    } catch (err) {
      return this.createUserForSocialNetwork(username, numRetries + 1);
    }
  }

  /**
     * @param {String} username
     * @param {String} password
     * @param {Number} numRetries
     */
  async createPeerplaysAccountForSocialNetwork(username, password, numRetries = 0) {
    const MAX_RETRIES = 5;

    if (numRetries >= MAX_RETRIES) {
      throw new Error('failed to create peerplays account, too many retries');
    }

    const hash = crypto.createHash('sha256').digest(username).toString('hex').slice(0, 32);
    const randomString = `${Math.floor(Math.min(1000 + Math.random() * 9000, 9999))}`; // random 4 digit number
    const seUsername = numRetries === 0 ? `se-${hash}` : `se-${hash}-${randomString}`;

    const keys = Login.generateKeys(
      seUsername,
      password,
      ['owner', 'active'],
      IS_PRODUCTION ? 'PPY' : 'TEST'
    );

    const ownerKey = keys.pubKeys.owner;
    const activeKey = keys.pubKeys.active;

    try {
      return await this.peerplaysRepository.createPeerplaysAccount(seUsername, ownerKey, activeKey);
    } catch (err) {
      if (err instanceof PeerplaysNameExistsError) {
        return await this.createPeerplaysAccountForSocialNetwork(username, password, numRetries + 1);
      }

      throw err;
    }
  }

  /**
     * Find user by network account id and create row if not exists
     * @param {String} network
     * @param account
     * @param {String} accessToken
     * @param {} req
     * @returns {Promise<UserModel>}
     */
  async getUserBySocialNetworkAccount(network, account, accessToken, req) {
    const loggedUser = req.user;
    req.session.newUser = false;
    req.session.save();

    const {id, email, picture, username, youtube, link} = account;
    const UserWithNetworkAccount = await this.userRepository.model.findOne({where: {[`${network}Id`]: id}});

    if (UserWithNetworkAccount && loggedUser && loggedUser.id !== UserWithNetworkAccount.id) {
      throw new Error('this account is already connected to another profile');
    }

    if (loggedUser) {
      return await this.connectSocialNetwork(network, account, loggedUser);
    }

    if (UserWithNetworkAccount) {
      return UserWithNetworkAccount;
    }

    req.session.newUser = true;
    req.session.save();

    const emailIsUsed = email && await this.userRepository.model.count({where: {email}});
    const User = await this.createUserForSocialNetwork(username);

    User[`${network}Id`] = id;
    User.avatar = picture;
    User.email = emailIsUsed ? null : email;
    User.isEmailVerified = emailIsUsed ? null : true;
    User.twitchUserName = network === 'twitch' ? username : null;
    User.googleName = network === 'google' ? username : '';
    User.facebook = network === 'facebook' ? username : '';
    User.facebookLink = network === 'facebook' ? link : '';
    User.youtube = youtube;
    
    if(network == 'twitch' && User.pubgId) {
      await this.changeUserType(User, userType.gamer);
    }

    const peerplaysPassword = `${User.username}-${accessToken}`;
    const peerplaysAccount = await this.createPeerplaysAccountForSocialNetwork(User.username, peerplaysPassword);

    User.peerplaysAccountName = peerplaysAccount.name;
    User.peerplaysAccountId = await this.peerplaysRepository.getAccountId(peerplaysAccount.name);
    User.peerplaysMasterPassword = peerplaysPassword;

    return await User.save();
  }

  async connectSocialNetwork(network, account, User) {
    const {id, email, picture, username, youtube} = account;

    if (User[`${network}Id`] === id) {
      return User;
    }

    const emailIsUsed = email && await this.userRepository.model.count({where: {email}});
    const usernameIsUsed = username && await this.userRepository.model.count({where: {username}});
    User[`${network}Id`] = id;

    if (network === 'twitch') {
      User.twitchUserName = username;
      
      if(User.pubgId) {
        await this.changeUserType(User, userType.gamer);
      }
    } else if (network === 'google') {
      User.googleName = username;
    } else if (network === 'facebook') {
      User.facebook = username;
    } else {
      throw new RestError(`Unexpected Network ${network}`);
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

  async changeUserType(user, newType) {
    // if the user is now a viewer refund any created challenges
    if (user.userType !== userType.viewer && newType === userType.viewer) {
      await this.challengeRepository.refundChallengesCreatedByUser(user);
    }

    user.userType = newType;
    await user.save();
    return user;
  }

  /**
     * @param {UserModel} User
     * @param updateObject
     * @param getClean
     * @returns {Promise<UserModel>}
     */
  async patchProfile(User, updateObject, getClean = true) {
    const newEmail = updateObject.email;

    if (newEmail && newEmail !== User.email) {
      // whenever the email address is changed issue a new verification token and send a verification email
      const {token} = await this.verificationTokenRepository.createToken(User.id, newEmail);
      await this.mailService.sendMailForChangeEmail(newEmail, token);
      // delete the email property as we want to change the email only after it has been verified
      delete updateObject.email;
    }

    // copy over properties from updateObject to the User
    Object.assign(User, updateObject);

    if(User.pubgUsername && User.twitchId) {
      await this.changeUserType(User, userType.gamer);
    }

    if (User.googleName === '') {
      User.googleName = null;
      User.googleId = null;
    }

    if (User.facebook === '') {
      User.facebook = null;
      User.facebookId = null;
    }

    if (User.twitchUserName === '') {
      User.twitchUserName = null;
      User.twitchId = null;
      await this.changeUserType(User, userType.viewer);
    }

    if (User.pubgUsername === '') {
      User.pubgUsername = null;
      User.pubgId = null;
      await this.changeUserType(User, userType.viewer);
    }

    // save any changes
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
      let error = details;

      if(error.base){
        error = {
          message: error.base.length > 0 ? error.base : 'Invalid active or owner key. '
        };
      }

      throw new RestError('Request error', 400, error);
    }

    User.peerplaysAccountName = name;
    await User.save();
    return this.getCleanUser(User);
  }


  /**
   * @param {UserModel} User
   * @returns {Promise<UserPublicObject>}
   */
  async getCleanUserForSearch(User) {
    return User.getPublicMinimal();
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
    return Promise.all(users.map(async (User) => this.getCleanUserForSearch(User)));
  }

  async signUpWithPassword(email, username, unhashedPassword) {
    const peerplaysAccountUsername = `se-${username}`;
    const peerplaysAccountPassword = await bcrypt.hash(`se-${unhashedPassword}${(new Date()).getTime()}`, 10);
    const keys = Login.generateKeys(
      peerplaysAccountUsername,
      peerplaysAccountPassword,
      ['owner', 'active'],
      IS_PRODUCTION ? 'PPY' : 'TEST'
    );
    const ownerKey = keys.pubKeys.owner;
    const activeKey = keys.pubKeys.active;

    const password = await bcrypt.hash(unhashedPassword, 10);
    const User = await this.userRepository.model.create({
      email, username, password
    });
    const {token} = await this.verificationTokenRepository.createToken(User.id, email);

    await this.mailService.sendMailAfterRegistration(email, token);

    await this.peerplaysRepository.createPeerplaysAccount(peerplaysAccountUsername,ownerKey, activeKey);

    User.peerplaysAccountName = peerplaysAccountUsername;
    User.peerplaysAccountId = await this.peerplaysRepository.getAccountId(peerplaysAccountUsername);
    User.peerplaysMasterPassword = peerplaysAccountPassword;
    await User.save();

    return this.getCleanUser(User);
  }

  async confirmEmail(ActiveToken) {
    const User = await this.userRepository.findByPk(ActiveToken.userId);
    User.isEmailVerified = true;
    // User.email = ActiveToken.email;
    await User.save();
    ActiveToken.isActive = false;
    await ActiveToken.save();
    return this.getCleanUser(User);
  }

  async getSignInUser(login, password) {
    const User = await this.userRepository.getByLogin(login);

    if (!User) {
      throw new Error('User not found');
    }

    if(User && User.isEmailVerified === false){
      throw new Error('Please verify your email address first');
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

    return this.getCleanUser(User);
  }

  async getUserTransactions(userId, skip, limit) {
    const transactions = await this.transactionRepository.searchTransactions(userId, limit, skip);
    return Promise.all(transactions.map(async (Tx) => Tx.getPublic()));
  }

  convertNotificationToBoolean(notifications) {
    let notificationBoolean = notifications;

    if (notifications !== true || notifications !== false) {
      if (parseInt(notifications, 10) === 1 || notifications.toLowerCase() === 'yes' || notifications.toLowerCase() === 'true') {
        notificationBoolean = true;
      } else if (parseInt(notifications, 10) === 0 || notifications.toLowerCase() === 'no' || notifications.toLowerCase() === 'false') {
        notificationBoolean = false;
      }
    }

    return notificationBoolean;
  }
  /**
     * Change notification status of user
     *
     * @param user
     * @param notifications
     * @returns {Promise<Array>}
     */
  async changeNotificationStatus(user, {notifications}) {

    const notification = this.convertNotificationToBoolean(notifications);
    const updatedNotification = await this.userRepository.updateNotification(user.id, notification);

    if (!updatedNotification[0]) {
      throw new Error(this.errors.NOTIFICATION_PREFERENCE_NOT_FOUND);
    }

    return updatedNotification;

  }

  async getUserYoutubeLink(tokens) {
    return this.googleRepository.getYoutubeLink(tokens);
  }

  /**
     *
     * @param {Number} userId
     * @param {*} args
     * @return {Promise<*>}
     */

  async donate(userId, {receiverId, donateOp, ppyAmount}) {
    const receiverUser = await this.userRepository.model.findOne({where: {id: receiverId}});

    if (!receiverUser) {
      throw new Error(this.errors.INVALID_RECEIVER_ACCOUNT);
    }

    const receiverAccount = receiverUser.peerplaysAccountId;

    if (!receiverAccount) {
      throw new Error(this.errors.INVALID_RECEIVER_ACCOUNT);
    }

    let broadcastResult;

    // use donateOp if set
    // otherwise try to create a tx using the user's stored peerplays credentials
    try{

      if (donateOp) {
        broadcastResult = await this.peerplaysRepository.broadcastSerializedTx(donateOp);
      } else {
        broadcastResult = await this.signAndBroadcastTx(userId, receiverAccount, ppyAmount);
      }

    }catch(ex) {
      logger.error(ex);

      if(ex.message.includes('insufficient')) {
        throw new RestError('', 400, {ppyAmount: [{message: 'Insufficient Balance'}]});
      }

      throw ex;
    }

    await this.transactionRepository.create({
      txId: broadcastResult[0].id,
      blockNum: broadcastResult[0].block_num,
      trxNum: broadcastResult[0].trx_num,
      ppyAmountValue: new BigNumber(broadcastResult[0].trx.operations[0][1].amount.amount).shiftedBy(-1 * this.peerplaysConnection.asset.precision),
      type: txTypes.donate,
      userId,
      receiverUserId: receiverId,
      challengeId: null,
      peerplaysFromId: broadcastResult[0].trx.operations[0][1].from,
      peerplaysToId: broadcastResult[0].trx.operations[0][1].to
    });

    return true;
  }

  async redeem(userId, {redeemOp, ppyAmount}) {
    let broadcastResult;

    try {
      if (redeemOp) {
        broadcastResult = await this.peerplaysRepository.broadcastSerializedTx(redeemOp);
      } else {
        broadcastResult = await this.signAndBroadcastTx(userId, this.config.peerplays.paymentAccountID, ppyAmount);
      }
    }catch(ex) {
      logger.error(ex);

      if(ex.message.includes('insufficient')) {
        throw new RestError('', 400, {ppyAmount: [{message: 'Insufficient Balance'}]});
      }

      throw ex;
    }

    const tx = await this.transactionRepository.create({
      txId: broadcastResult[0].id,
      blockNum: broadcastResult[0].block_num,
      trxNum: broadcastResult[0].trx_num,
      ppyAmountValue: broadcastResult[0].trx.operations[0][1].amount.amount,
      type: txTypes.redeem,
      userId,
      peerplaysFromId: broadcastResult[0].trx.operations[0][1].from,
      peerplaysToId: broadcastResult[0].trx.operations[0][1].to
    });

    const redeemPercent = this.config.challenge.userRedeemPercent;

    await this.paypalRedemptionRepository.createRedemption(userId, {
      amountCurrency: 'USD',
      amountValue: tx.ppyAmountValue * redeemPercent,
      transactionId: tx.id
    });

    return true;
  }

  /**
     * Creates, signs and broadcasts a Peerplays transaction from a given user
     * @param {String} senderId
     * @param {String} receiverAccount
     * @param {Number} ppyAmount
     * @returns {Promise<*>}
     */
  async signAndBroadcastTx(senderId, receiverAccount, ppyAmount) {
    if (typeof ppyAmount !== 'number' || ppyAmount <= 0.0) {
      throw new Error(this.errors.INVALID_PPY_AMOUNT);
    }

    const senderUser = await this.userRepository.findByPk(senderId);

    if (!senderUser) {
      throw new Error(this.errors.USER_NOT_FOUND);
    }

    if (!senderUser.peerplaysAccountId || !senderUser.peerplaysMasterPassword) {
      throw new Error(this.errors.PEERPLAYS_ACCOUNT_MISSING);
    }

    if (!receiverAccount || senderUser.peerplaysAccountId === receiverAccount) {
      throw new Error(this.errors.INVALID_RECEIVER_ACCOUNT);
    }

    // create a new transaction
    const tx = new this.peerplaysConnection.TransactionBuilder();

    // convert the amount to a bignumber
    const amount = new BigNumber(ppyAmount).shiftedBy(this.peerplaysConnection.asset.precision).integerValue().toNumber();

    // add a transfer operation from the senderUser's account to receiverAccount
    tx.add_type_operation('transfer', {
      from: senderUser.peerplaysAccountId,
      to: receiverAccount,
      amount: {amount, asset_id: this.config.peerplays.sendAssetId},
      fee: {amount: 0, asset_id: this.config.peerplays.sendAssetId}
    });

    await tx.set_required_fees();

    // generate the active keys for the sender and sign the transaction
    const keys = Login.generateKeys(
      senderUser.peerplaysAccountName,
      senderUser.peerplaysMasterPassword,
      ['active'],
      IS_PRODUCTION ? 'PPY' : 'TEST'
    );

    tx.add_signer(keys.privKeys.active, keys.pubKeys.active);

    // finally broadcast the transaction
    return await tx.broadcast();
  }

  async changeEmail(ActiveToken) {
    const User = await this.userRepository.findByPk(ActiveToken.userId);
    User.isEmailVerified = true;
    User.email = ActiveToken.email;

    await User.save();
    ActiveToken.isActive = false;
    await ActiveToken.save();
    return User.getPublic();
  }

  async loginPeerplaysUser(login, password, LoggedUser = null) {
    const PeerplaysUser = await this.peerplaysRepository.getPeerplaysUser(login, password);

    if (!PeerplaysUser) {
      throw new RestError('', 400, {login: [{message: 'Invalid peerplays account'}]});
    }

    const userWithPeerplaysAccount = await this.userRepository.getByPeerplaysAccountName(login);

    if (userWithPeerplaysAccount && LoggedUser && LoggedUser.id !== userWithPeerplaysAccount.id) {
      throw new RestError('', 409, {image: [{login: 'This account is already connected to another profile'}]});
    }

    if(userWithPeerplaysAccount) {

      if (userWithPeerplaysAccount.status === profileConstants.status.banned) {
        throw new RestError('You have been banned. Please contact our admins for potential unban.',403);
      }

      const user = await this.getCleanUser(userWithPeerplaysAccount);
      user['newUser'] = false;
      return user;
    }

    //If the user is already logged in and no peerplays account is linked then link this account
    if(LoggedUser && !userWithPeerplaysAccount) {
      LoggedUser.peerplaysAccountName = login;
      LoggedUser.peerplaysAccountId = PeerplaysUser[1].account.id;
      LoggedUser.peerplaysMasterPassword = '';
      await LoggedUser.save();
      const user = await this.getCleanUser(LoggedUser);
      user['newUser'] = false;
      return user;
    }

    const NewUser = await this.userRepository.model.create({
      username: await this.getUsernameForPeerplaysAccount(login),
      password,
      peerplaysAccountName: login,
      peerplaysAccountId: PeerplaysUser[1].account.id
    });

    await NewUser.save();

    const user = await this.getCleanUser(NewUser);
    user['newUser'] = true;
    return user;
  }

  async getUsernameForPeerplaysAccount(accountName, numRetries=0){
    const MAX_RETRIES = 5;
    let username = accountName;

    if (numRetries >= MAX_RETRIES) {
      throw new RestError('Failed to create user, too many retries',400);
    }

    const UsernameExists = await this.userRepository.getByLogin(username);

    if(UsernameExists) {
      const randomString = `${Math.floor(Math.min(1000 + Math.random() * 9000, 9999))}`; // random 4 digit number
      username = this.getUsernameForPeerplaysAccount(accountName + randomString, numRetries + 1);
    }

    return username;
  }

}

module.exports = UserService;
