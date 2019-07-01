const challengeConstants = require('../constants/challenge');
const invitationConstants = require('../constants/invitation');
const {types: txTypes} = require('../constants/transaction');

class ChallengeService {

  /**
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {ChallengeConditionRepository} opts.challengeConditionRepository
   * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
   * @param {UserRepository} opts.userRepository
   * @param {WhitelistedUsersRepository} opts.whitelistedUsersRepository
   * @param {WhitelistedGamesRepository} opts.whitelistedGamesRepository
   * @param {WebPushConnection} opts.webPushConnection
   * @param {PeerplaysRepository} opts.peerplaysRepository
   */
  constructor(opts) {
    this.challengeRepository = opts.challengeRepository;
    this.challengeConditionRepository = opts.challengeConditionRepository;
    this.userRepository = opts.userRepository;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
    this.userRepository = opts.userRepository;
    this.whitelistedUsersRepository = opts.whitelistedUsersRepository;
    this.whitelistedGamesRepository = opts.whitelistedGamesRepository;
    this.webPushConnection = opts.webPushConnection;
    this.vapidData = {};
    this.userVapidKeys = {};
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
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

        const vapidKeys = this.userVapidKeys[id];
        const invitation = {title: `You invited to ${Challenge.name}`};

        const invitationState = await this.userRepository.findByPk(id);

        switch (invitationState.invitations) {
          case invitationConstants.invitationStatus.all:
            return await this.webPushConnection.sendNotification(this.vapidData[id], vapidKeys, invitation);
          case invitationConstants.invitationStatus.users: {
            const isAllowedForUser = await this.whitelistedUsersRepository.isWhitelistedFor(id, creatorId);

            if (isAllowedForUser) {
              return await this.webPushConnection.sendNotification(this.vapidData[id], vapidKeys, invitation);
            }
          }

            break;
          default:
            return;
        }
      }));

    }

    if (challengeObject.accessRule === challengeConstants.accessRules.anyone) {

      await Promise.all(Object.keys(this.vapidData).map(async (userId) => {
        const notificationsState = await this.userRepository.findByPk(userId);

        if (notificationsState.notifications === true) {
          const vapidKeys = this.userVapidKeys[userId];
          const notification = {title: `Challenge ${Challenge.name} appeared`};
          await this.webPushConnection.sendNotification(this.vapidData[userId], vapidKeys, notification);
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
   * @param userId
   * @returns {Promise<String>}
   */
  async checkUserSubscribe(userId) {

    if (this.userVapidKeys.hasOwnProperty(userId)) {
      return this.userVapidKeys[userId].publicKey;
    }

    if (!this.userVapidKeys.hasOwnProperty(userId)) {
      const vapidKeys = this.webPushConnection.generateVapidKeys();
      this.userVapidKeys[userId] = {
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey
      };

      return this.userVapidKeys[userId].publicKey;
    }

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

    const vapidKeys = this.userVapidKeys[toUserWithId];
    const invitation = {title: `You invited to ${challenge.name}`};

    const accessStatus = await this.userRepository.findByPk(toUserWithId);

    const isInvited = await this.challengeInvitedUsersRepository.isUserInvited(challengeId, toUserWithId);

    if (challenge.accessRule !== challengeConstants.accessRules.anyone && !isInvited) {
      throw this.errors.DO_NOT_RECEIVE_INVITATIONS;
    }

    switch (accessStatus.invitations) {
      case invitationConstants.invitationStatus.users: {
        const isAllowedForUser = await this.whitelistedUsersRepository.isWhitelistedFor(toUserWithId, fromUser.id);

        if (isAllowedForUser) {
          return await this.webPushConnection.sendNotification(this.vapidData[toUserWithId], vapidKeys, invitation);
        }
      }

        break;
      case invitationConstants.invitationStatus.games: {
        const isAllowedForGame = await this.whitelistedGamesRepository.isWhitelistedFor(toUserWithId, challengeId);

        if (isAllowedForGame) {
          return await this.webPushConnection.sendNotification(this.vapidData[toUserWithId], vapidKeys, invitation);
        }
      }

        break;
      case invitationConstants.invitationStatus.all:
        return await this.webPushConnection.sendNotification(this.vapidData[toUserWithId], vapidKeys, invitation);
      default:
        return;
    }

  }

}

module.exports = ChallengeService;
