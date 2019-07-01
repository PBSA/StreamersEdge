const challengeConstants = require('../../../constants/challenge');
const txConstants = require('../../../constants/transaction');

class PaymentsJob {

  /**
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {JoinedUsersRepository} opts.joinedUsersRepository
   * @param {UserRepository} opts.userRepository
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {PubgService} opts.pubgService
   * @param {TransactionRepository} opts.transactionRepository
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.joinedUsersRepository = opts.joinedUsersRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.challengeRepository = opts.challengeRepository;
    this.userRepository = opts.userRepository;
    this.transactionRepository = opts.transactionRepository;
    this.config = opts.config;
  }

  /**
   * Pull Games pubg for all users who have added their pubg account into profile
   * @returns {Promise<void>}
   */
  async runJob() {
    const Challenges = await this.challengeRepository.model.findAll({
      where: {
        status: challengeConstants.status.resolved
      }
    });

    for(let i = 0; i < Challenges.length; i++) {
      await this.processChallenge(Challenges[i]);
    }

  }

  async processChallenge(Challenge) {
    if (Challenge.winnerUserId) {
      await this.payToWinner(Challenge);
    } else {
      const joined = await this.joinedUsersRepository.model.findOne({
        where: {challengeId: Challenge.id}
      });

      if (joined) {
        await this.payToOwner(Challenge);
      } else {
        await this.payToCreator(Challenge);
      }
    }
  }

  async payToWinner(Challenge) {
    console.log(Challenge);
    // TODO will be ended on a next branch
  }

  async payToOwner(Challenge) {
    console.log(Challenge);
    // TODO will be ended on a next branch
  }

  async payToCreator(Challenge) {
    const creator = await this.userRepository.model.findByPk(Challenge.userId);

    if (!creator.peerplaysAccountId) {
      return;
    }

    const result = await this.peerplaysRepository.sendPPYFromReceiverAccount(creator.peerplaysAccountId, Challenge.ppyAmount);
    await this.transactionRepository.create({
      txId: result.id,
      blockNum: result.block_num,
      trxNum: result.trx_num,
      ppyAmountValue: Challenge.ppyAmount,
      type: txConstants.types.challengeRefund,
      userId: creator.id,
      challengeId: Challenge.id,
      peerplaysFromId: this.config.peerplays.paymentReceiver,
      peerplaysToId: creator.peerplaysAccountId
    });

    Challenge.status = challengeConstants.status.paid;
    await Challenge.save();
  }

}

module.exports = PaymentsJob;
