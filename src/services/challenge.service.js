const challengeConstants = require('../constants/challenge');
const {types: txTypes} = require('../constants/transaction');

class ChallengeService {

  /**
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {ChallengeConditionRepository} opts.challengeConditionRepository
   * @param {ChallengeInvitedUsersRepository} opts.challengeInvitedUsersRepository
   * @param {UserRepository} opts.userRepository
   * @param {PeerplaysRepository} opts.peerplaysRepository
   */
  constructor(opts) {
    this.challengeRepository = opts.challengeRepository;
    this.challengeConditionRepository = opts.challengeConditionRepository;
    this.userRepository = opts.userRepository;
    this.challengeInvitedUsersRepository = opts.challengeInvitedUsersRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
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
        return await this.challengeInvitedUsersRepository.create({
          challengeId: Challenge.id,
          userId: id
        });
      }));
    }

    await this.transactionRepository.create({
      txId: broadcastResult[0].id,
      blockNum: broadcastResult[0].block_num,
      trxNum: broadcastResult[0].trx_num,
      ppyAmountValue: challengeObject.ppyAmount,
      type: txTypes.challengeCreation,
      userId: creatorId,
      challengeId: Challenge.id
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

}

module.exports = ChallengeService;
