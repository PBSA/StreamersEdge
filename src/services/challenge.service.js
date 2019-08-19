const challengeConstants = require('../constants/challenge');
const {types: txTypes} = require('../constants/transaction');
const invitationConstants = require('../constants/invitation');

class ChallengeService {

  /**
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {ChallengeConditionRepository} opts.challengeConditionRepository
   * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
   * @param {UserRepository} opts.userRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {WhitelistedUsersRepository} opts.whitelistedUsersRepository
   * @param {WhitelistedGamesRepository} opts.whitelistedGamesRepository
   * @param {WebPushConnection} opts.webPushConnection
   */
  constructor(opts) {
    this.challengeRepository = opts.challengeRepository;
    this.challengeConditionRepository = opts.challengeConditionRepository;
    this.userRepository = opts.userRepository;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
    this.whitelistedUsersRepository = opts.whitelistedUsersRepository;
    this.whitelistedGamesRepository = opts.whitelistedGamesRepository;
    this.webPushConnection = opts.webPushConnection;
    this.errors = {
      DO_NOT_RECEIVE_INVITATIONS: 'THIS_IS_PRIVATE_CHALLENGE',
      CHALLENGE_NOT_FOUND: 'CLASSIC_GAME_NOT_FOUND'
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

    return this.getCleanObject(Challenge.id);
  }

  /**
   * @param challengeId
   * @returns {Promise<ChallengePublicObject>}
   */
  async getCleanObject(challengeId) {
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
      return null;
    }

    return Challenge.getPublic();
  }

  /**
   * @param user
   * @returns {Promise<String>}
   */
  async checkUserSubscribe(user, data) {
    if(user.vapidKey === null ){
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
          return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, vapidKeys, invitation);
        }
      }

        break;
      case invitationConstants.invitationStatus.games: {

        const isAllowedForGame = await this.whitelistedGamesRepository.isWhitelistedFor(toUserWithId, challenge.game);

        if (isAllowedForGame) {
          return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, vapidKeys, invitation);
        }
      }

        break;
      case invitationConstants.invitationStatus.all:
        return await this.webPushConnection.sendNotification(toUser.challengeSubscribeData, vapidKeys, invitation);
      default:
        return;
    }
  }

}

module.exports = ChallengeService;
