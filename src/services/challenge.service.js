const challengeConstants = require('../constants/challenge');


class ChallengeService {

  /**
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {ChallengeConditionRepository} opts.challengeConditionRepository
   * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
   * @param {UserRepository} opts.userRepository
   * @param {WebPushConnection} opts.webPushConnection
   */
  constructor(opts) {
    this.challengeRepository = opts.challengeRepository;
    this.challengeConditionRepository = opts.challengeConditionRepository;
    this.userRepository = opts.userRepository;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
    this.webPushConnection = opts.webPushConnection;
    this.vapidData = {};
    this.userVapidKeys = {};
    this.errors = {
      challengeNotFound: 'classicGame_NOT_FOUND',
      isNotAccessedToAnyone: 'challenge_IS_NOT_ACCESSED_TO_ANYONE'
    };
  }

  /**
   *
   * @param creatorId
   * @param challengeObject
   * @returns {Promise<ChallengePublicObject>}
   */
  async createChallenge(creatorId, challengeObject) {
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
      const creatorEmail = await this.userRepository.findByPk(creatorId);

      await Promise.all(challengeObject.invitedAccounts.map(async (id) => {
        await this.challengeInvitedUsersRepository.create({
          challengeId: Challenge.id,
          userId: id
        });

        const vapidKeys = this.userVapidKeys[id];
        const invitation = {title: `You invited to ${Challenge.name}`};
        await this.webPushConnection.sendNotificaton(this.vapidData[id], creatorEmail.email, vapidKeys, invitation);
      }));

    }

    if (challengeObject.accessRule === challengeConstants.accessRules.anyone) {
      const creatorEmail = await this.userRepository.findByPk(creatorId);

      await Promise.all(Object.keys(this.vapidData).map(async (userId) => {
        const vapidKeys = this.userVapidKeys[userId];
        const notification = {title: `Challenge ${Challenge.name} appeared`};
        await this.webPushConnection.sendNotificaton(this.vapidData[userId], creatorEmail.email, vapidKeys, notification);
      }));

    }

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

    const vapidKeys = this.webPushConnection.generateVapidKeys();
    this.userVapidKeys[userId] = {
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey
    };

    return this.userVapidKeys[userId].publicKey;

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
      throw new Error(this.errors.challengeNotFound);
    }

    if (challenge.accessRule !== challengeConstants.accessRules.anyone) {
      throw new Error(this.errors.isNotAccessedToAnyone);
    }

    const vapidKeys = this.userVapidKeys[toUserWithId];
    const invitation = {title: `You invited to ${challenge.name}`};
    return await this.webPushConnection.sendNotificaton(this.vapidData[toUserWithId], fromUser.email, vapidKeys, invitation);

  }

}

module.exports = ChallengeService;
