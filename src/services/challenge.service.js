const challengeConstants = require('../constants/challenge');

class ChallengeService {

  /**
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {ChallengePubgRepository} opts.challengePubgRepository
   * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
   * @param {UserRepository} opts.userRepository
   */
  constructor(opts) {
    this.challengeRepository = opts.challengeRepository;
    this.pubgRepository = opts.challengePubgRepository;
    this.userRepository = opts.userRepository;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
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
      ppyAmount: challengeObject.ppyAmount
    });

    await this[`${challengeObject.game}Repository`].create({
      challengeId: Challenge.id,
      ...challengeObject.params
    });

    if (challengeObject.accessRule === challengeConstants.accessRules.invite) {
      await Promise.all(challengeObject.invitedAccounts.map(async (id) => {
        return this.challengeInvitedUsersRepository.create({
          challengeId: Challenge.id,
          userId: id
        });
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
        model: this.pubgRepository.model
      }, {
        model: this.challengeInvitedUsersRepository.model
      }]
    });

    if (!Challenge) {
      return null;
    }

    return Challenge.getPublic();
  }

}

module.exports = ChallengeService;
