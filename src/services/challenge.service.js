const BigNumber = require('bignumber.js');
const challengeConstants = require('../constants/challenge');
const invitationConstants = require('../constants/invitation');
const {types: txTypes} = require('../constants/transaction');

class ChallengeService {

  /**
     * @param {AppConfig} opts.config
     * @param {ChallengeRepository} opts.challengeRepository
     * @param {ChallengeConditionRepository} opts.challengeConditionRepository
     * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
     * @param {UserRepository} opts.userRepository
     * @param {WhitelistedUsersRepository} opts.whitelistedUsersRepository
     * @param {WhitelistedGamesRepository} opts.whitelistedGamesRepository
     * @param {JoinedUsersRepository} opts.joinedUsersRepository
     * @param {WebPushConnection} opts.webPushConnection
     * @param {PeerplaysRepository} opts.peerplaysRepository
     * @param {PeerplaysConnection} opts.peerplaysConnection
     * @param {DbConnection} opts.dbConnection
     */
  constructor(opts) {
    this.config = opts.config;
    this.challengeRepository = opts.challengeRepository;
    this.challengeConditionRepository = opts.challengeConditionRepository;
    this.userRepository = opts.userRepository;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
    this.userRepository = opts.userRepository;
    this.whitelistedUsersRepository = opts.whitelistedUsersRepository;
    this.whitelistedGamesRepository = opts.whitelistedGamesRepository;
    this.webPushConnection = opts.webPushConnection;
    this.dbConnection = opts.dbConnection;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
    this.peerplaysConnection = opts.peerplaysConnection;
    this.errors = {
      DO_NOT_RECEIVE_INVITATIONS: 'THIS_IS_PRIVATE_CHALLENGE',
      CHALLENGE_NOT_FOUND: 'CLASSIC_GAME_NOT_FOUND',
      TRANSACTION_ERROR: 'TRANSACTION_ERROR',
      INVALID_TRANSACTION_SENDER: 'INVALID_TRANSACTION_SENDER',
      INVALID_TRANSACTION_RECEIVER: 'INVALID_TRANSACTION_RECEIVER',
      INVALID_TRANSACTION_AMOUNT: 'INVALID_TRANSACTION_AMOUNT',
      UNABLE_TO_INVITE: 'UNABLE_TO_INVITE'

    };
  }

  /**
     *
     * @param creatorId
     * @param challengeObject
     * @returns {Promise<ChallengePublicObject>}
     */
  async createChallenge(creatorId, challengeObject) {
    const broadcastResult = await this.peerplaysRepository.broadcastSerializedTx(challengeObject.depositOp);

    const Challenge = await this.challengeRepository.create({
      userId: creatorId,
      name: challengeObject.name,
      startDate: challengeObject.startDate,
      endDate: challengeObject.endDate,
      game: challengeObject.game,
      accessRule: challengeObject.accessRule,
      ppyAmount: challengeObject.ppyAmount,
      conditionsText: challengeObject.conditionsText
    });

    await Promise.all(challengeObject.conditions.map(async (criteria) => {
      return await this.challengeConditionRepository.create({
        ...criteria,
        challengeId: Challenge.id
      });
    }));

    if (challengeObject.accessRule === challengeConstants.accessRules.invite) {
      await Promise.all(challengeObject.invitedAccounts.map(async (id) => {
        await this.challengeInvitedUsersRepository.create({
          challengeId: Challenge.id,
          userId: id
        });

        const toUser = await this.userRepository.findByPk(id);

        const invitation = {title: `You invited to ${Challenge.name}`};

        switch (toUser.invitations) {
          case invitationConstants.invitationStatus.all:
            return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, toUser.vapidKey, invitation);
          case invitationConstants.invitationStatus.users: {
            const isAllowedForUser = await this.whitelistedUsersRepository.isWhitelistedFor(id, creatorId);

            if (isAllowedForUser) {
              return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, toUser.vapidKey, invitation);
            }
          }

            break;
          case invitationConstants.invitationStatus.games: {
            const isAllowedForGame = await this.whitelistedGamesRepository.isWhitelistedFor(id, challengeObject.game);

            if (isAllowedForGame) {
              return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, toUser.vapidKey, invitation);
            }
          }

            break;
          default:
            return;
        }
      }));

    }

    if (challengeObject.accessRule === challengeConstants.accessRules.anyone) {

      const users = await this.userRepository.findWithChallengeSubscribed();
      await Promise.all(users.map(async (toUser) => {
        if (toUser.notifications === true) {
          const notification = {title: `Challenge ${Challenge.name} appeared`};
          await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, toUser.vapidKey, notification);
        }
      }));

    }

    await this.transactionRepository.create({
      txId: broadcastResult[0].id,
      blockNum: broadcastResult[0].block_num,
      trxNum: broadcastResult[0].trx_num,
      ppyAmountValue: challengeObject.ppyAmount,
      type: txTypes.challengeCreation,
      userId: creatorId,
      challengeId: Challenge.id,
      peerplaysFromId: challengeObject.depositOp.operations[0][1].from,
      peerplaysToId: challengeObject.depositOp.operations[0][1].to
    });
    return this.getCleanObject(Challenge.id, challengeObject.invitedAccounts || creatorId);
  }

  /**
     * @param challengeId
     * @param userId
     * @returns {Promise<ChallengePublicObject>}
     */
  async getCleanObject(challengeId, userId) {
    const Challenge = await this.challengeRepository.findByPk(challengeId, {
      include: [{
        model: this.userRepository.model,
        required: true
      }, {
        model: this.challengeConditionRepository.model
      }, {
        model: this.challengeInvitedUsersRepository.model
      }]
    });

    if (!Challenge) {
      throw this.errors.CHALLENGE_NOT_FOUND;
    }

    switch (Challenge.accessRule) {
      case challengeConstants.accessRules.invite: {
        const checkAccess = await this.challengeInvitedUsersRepository.isAllowFor(challengeId, userId);

        if (!checkAccess) {
          throw this.errors.DO_NOT_RECEIVE_INVITATIONS;
        }

        return Challenge.getPublic();
      }

      default:
        return Challenge.getPublic();
    }
  }


  async checkUserSubscribe(user, data) {
    if (user.vapidKey === null) {
      const vapidKeys = this.webPushConnection.generateVapidKeys();
      user.vapidKey = {
        ...vapidKeys
      };
    }

    user.challengeSubscribeData = data;
    user.save();
    return user.vapidKey.publicKey;
  }

  /**
     * @param fromUser
     * @param toUserWithId
     * @param challengeId
     * @returns {Promise<Object>}
     */
  async sendInvite(fromUser, toUserWithId, challengeId) {

    const challenge = await this.challengeRepository.findByPk(challengeId);

    if (!challenge) {
      throw this.errors.CHALLENGE_NOT_FOUND;
    }

    const toUser = await this.userRepository.findByPk(toUserWithId);

    const vapidKeys = toUser.vapidKey;
    const invitation = {title: `You invited to ${challenge.name}`};

    const isInvited = await this.challengeInvitedUsersRepository.isUserInvited(challengeId, toUserWithId);

    if (challenge.accessRule !== challengeConstants.accessRules.anyone && !isInvited) {
      throw this.errors.DO_NOT_RECEIVE_INVITATIONS;
    }

    switch (toUser.invitations) {
      case invitationConstants.invitationStatus.users: {
        const isAllowedForUser = await this.whitelistedUsersRepository.isWhitelistedFor(toUserWithId, fromUser.id);

        if (isAllowedForUser) {
          try{
            return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, vapidKeys, invitation);
          } catch(err) {
            throw this.errors.UNABLE_TO_INVITE;
          }
        }
      }

        break;
      case invitationConstants.invitationStatus.games: {

        const isAllowedForGame = await this.whitelistedGamesRepository.isWhitelistedFor(toUserWithId, challenge.game);

        if (isAllowedForGame) {
          try{
            return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, vapidKeys, invitation);
          } catch(err) {
            throw this.errors.UNABLE_TO_INVITE;
          }
        }
      }

        break;

      case invitationConstants.invitationStatus.all:
        try{
          return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, vapidKeys, invitation);
        } catch(err) {
          throw this.errors.UNABLE_TO_INVITE;
        }

      default:
        return;
    }
  }

  async getAllChallenges(userId) {
    return await this.challengeRepository.findAllChallenges(userId);
  }

  async joinToChallenge(userId, challengeId, bcTx) {
    const operation = bcTx.operations[0][1];
    return await this.dbConnection.sequelize.transaction(async (dbTx) => {
      if (operation.to !== this.config.peerplays.paymentReceiver) {
        throw new Error(this.errors.INVALID_TRANSACTION_RECEIVER);
      }

      if (!new BigNumber(operation.amount.amount).eq(this.config.challenge.joinFee)) {
        throw new Error(this.errors.INVALID_TRANSACTION_AMOUNT);
      }

      const [user, challenge] = await Promise.all([
        this.userRepository.findByPk(userId, {transaction: dbTx}),
        this.challengeRepository.findByPk(challengeId, {transaction: dbTx})
      ]);

      if (user.peerplaysAccountId === '') {
      //  await this.userRepository.setPeerplaysAccountId(userId, operation.from);
        await this.userRepository.setAccountId(userId,operation.from);
      } else if (operation.from !== user.peerplaysAccountId) {
        throw new Error(this.errors.INVALID_TRANSACTION_SENDER);
      }

      if (!challenge) {
        throw new Error(this.errors.CHALLENGE_NOT_FOUND);
      }

      if (challenge.accessRule === challengeConstants.accessRules.invite) {
        if (!await this.challengeInvitedUsersRepository.isAllowFor(challengeId, userId)) {
          throw new Error(this.errors.DO_NOT_RECEIVE_INVITATIONS);
        }
      }

      const res = await new Promise(async (resolve, reject) => {
        await this.peerplaysConnection.networkAPI.exec('broadcast_transaction_with_callback', [resolve, bcTx])
          .catch((err) => {
            const error = new Error(this.errors.TRANSACTION_ERROR);
            error.data = err;
            reject(error);
          });
      });
      await this.challengeInvitedUsersRepository.joinToChallenge(userId, challengeId,{transaction: dbTx});
      return res;
    });

  }

}

module.exports = ChallengeService;
