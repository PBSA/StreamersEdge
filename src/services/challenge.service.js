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
    this.whitelistedUsersRepository = opts.whitelistedUsersRepository;
    this.whitelistedGamesRepository = opts.whitelistedGamesRepository;
    this.webPushConnection = opts.webPushConnection;
    this.dbConnection = opts.dbConnection;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
    this.peerplaysConnection = opts.peerplaysConnection;
    this.userService = opts.userService;
    this.errors = {
      DO_NOT_RECEIVE_INVITATIONS: 'THIS_IS_PRIVATE_CHALLENGE',
      CHALLENGE_NOT_FOUND: 'CLASSIC_GAME_NOT_FOUND',
      CHALLENGE_NOT_OPEN: 'CHALLENGE_NOT_OPEN',
      TRANSACTION_ERROR: 'TRANSACTION_ERROR',
      INVALID_TRANSACTION_SENDER: 'INVALID_TRANSACTION_SENDER',
      INVALID_TRANSACTION_RECEIVER: 'INVALID_TRANSACTION_RECEIVER',
      INVALID_TRANSACTION_AMOUNT: 'INVALID_TRANSACTION_AMOUNT',
      UNABLE_TO_INVITE: 'UNABLE_TO_INVITE',
      INVITED_USER_NOT_FOUND: 'INVITED_USER_NOT_FOUND'
    };
    this.joinedUsersRepository = opts.joinedUsersRepository;
  }

  /**
     *
     * @param creatorId
     * @param challengeObject
     * @returns {Promise<ChallengePublicObject>}
     */
  async createChallenge(creatorId, challengeObject) {
    let broadcastResult;

    // use the signed tx in depositOp if set
    // otherwise try to create a tx using the user's stored peerplay credentials
    if (challengeObject.depositOp) {
      broadcastResult = await this.peerplaysRepository.broadcastSerializedTx(challengeObject.depositOp);
    } else {
      const depositAccount = this.config.peerplays.paymentReceiver;
      broadcastResult = await this.userService.signAndBroadcastTx(creatorId, depositAccount, challengeObject.ppyAmount);
    }

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
        const toUser = await this.userRepository.findByPk(id);

        if (toUser.minInvitationBounty > challengeObject.ppyAmount) {
          return;
        }

        const invitation = {title: `You invited to ${Challenge.name}`};

        switch (toUser.invitations) {
          case invitationConstants.invitationStatus.all:
            await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
            return await this.CreateChallengeInvitedUser(Challenge.id,id);
    
          case invitationConstants.invitationStatus.users: {
            const isAllowedForUser = await this.whitelistedUsersRepository.isWhitelistedFor(id, creatorId);

            if (isAllowedForUser) {
              await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
              return await this.CreateChallengeInvitedUser(Challenge.id,id);
            }
          }

            break;
          case invitationConstants.invitationStatus.games: {
            const isAllowedForGame = await this.whitelistedGamesRepository.isWhitelistedFor(id, challengeObject.game);

            if (isAllowedForGame) {
              await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
              return await this.CreateChallengeInvitedUser(Challenge.id,id);
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
          await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, notification);
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
      peerplaysFromId: broadcastResult[0].trx.operations[0][1].from,
      peerplaysToId: broadcastResult[0].trx.operations[0][1].to
    });
    return this.getCleanObject(Challenge.id, challengeObject.invitedAccounts || creatorId);
  }

  async CreateChallengeInvitedUser(challengeId, userId) {
    return await this.challengeInvitedUsersRepository.create({
      challengeId,
      userId
    });
  }

  /**
     * @param challengeId
     * @param userId
     * @returns {Promise<ChallengePublicObject>}
     */
  async getCleanObject(challengeId, userId) {
    const Challenge = await this.challengeRepository.findByPk(challengeId, {
      include: [{
        model: this.userRepository.model
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
        const checkAccess = await this.challengeInvitedUsersRepository.isUserInvited(challengeId, userId);

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
    user.challengeSubscribeData = data;
    user.save();
    return true;
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

    if(!toUser) {
      throw this.errors.INVITED_USER_NOT_FOUND;
    }

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
            return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
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
            return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
          } catch(err) {
            throw this.errors.UNABLE_TO_INVITE;
          }
        }
      }

        break;

      case invitationConstants.invitationStatus.all:
        try{
          return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, invitation);
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

  async joinToChallenge(userId, challengeId, joinOp) {
    const user = await this.userRepository.findByPk(userId);
    const challenge = await this.challengeRepository.findByPk(challengeId);

    if (!challenge) {
      throw new Error(this.errors.CHALLENGE_NOT_FOUND);
    }

    if (challenge.status !== challengeConstants.status.open) {
      throw new Error(this.errors.CHALLENGE_NOT_OPEN);
    }

    if (challenge.accessRule === challengeConstants.accessRules.invite) {
      if (!await this.challengeInvitedUsersRepository.isAllowFor(challengeId, userId)) {
        throw new Error(this.errors.DO_NOT_RECEIVE_INVITATIONS);
      }
    }

    if (joinOp) {
      const operation = joinOp.operations[0][1];

      if (operation.to !== this.config.peerplays.feeReceiver) {
        throw new Error(this.errors.INVALID_TRANSACTION_RECEIVER);
      }

      if (user.peerplaysAccountId === '') {
        await this.userRepository.setPeerplaysAccountId(userId, operation.from);
      } else if (operation.from !== user.peerplaysAccountId) {
        throw new Error(this.errors.INVALID_TRANSACTION_SENDER);
      }

      if (!new BigNumber(operation.amount.amount).eq(this.config.challenge.joinFee)) {
        throw new Error(this.errors.INVALID_TRANSACTION_AMOUNT);
      }

      await this.peerplaysRepository.broadcastSerializedTx(joinOp);
    } else {
      await this.userService.signAndBroadcastTx(userId, this.config.peerplays.feeReceiver, this.config.challenge.joinFee);
    }

    return await this.joinedUsersRepository.joinToChallenge(userId, challengeId);
  }

}

module.exports = ChallengeService;
