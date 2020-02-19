const challengeConstants = require('../../../constants/challenge');
const txConstants = require('../../../constants/transaction');

class PaymentsJob {

  /**
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {JoinedUsersRepository} opts.joinedUsersRepository
   * @param {UserRepository} opts.userRepository
   * @param {ChallengeRepository} opts.challengeRepository
   * @param {ChallengeWinnersRepository} opts.challengeWinnersRepository
   * @param {PubgService} opts.pubgService
   * @param {TransactionRepository} opts.transactionRepository
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.joinedUsersRepository = opts.joinedUsersRepository;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.challengeRepository = opts.challengeRepository;
    this.challengeWinnersRepository = opts.challengeWinnersRepository;
    this.userRepository = opts.userRepository;
    this.transactionRepository = opts.transactionRepository;
    this.config = opts.config;

    this.processChallenge = this.processChallenge.bind(this);
  }

  /**
   * Pull Games pubg for all users who have added their pubg account into profile
   * @returns {Promise<void>}
   */
  async runJob() {
    const challenges = await this.challengeRepository.model.findAll({
      where: {
        status: challengeConstants.status.resolved
      }
    });

    await Promise.all(challenges.map(this.processChallenge));
  }

  async processChallenge(challenge) {
    const winners = await this.challengeWinnersRepository.getForChallenge(challenge.id);

    if (winners.length !== 0) {
      await this.payToWinners(challenge, winners[0]);
    } else {
      await this.challengeRepository.refundChallenge(challenge);
    }
  }

  async payToWinners(challenge, winner) {
    const user = await this.userRepository.findByPk(winner.userId);
    
    const joined = await this.joinedUsersRepository.model.findAll({
      where: {challengeId: challenge.id}
    });

    const totalReward = joined.reduce((acc, {ppyAmount}) => acc + ppyAmount, 0.0);

    await this.sendPPY('challengeReward', challenge, user, totalReward);

    challenge.status = challengeConstants.status.paid;
    await challenge.save();
  }

  async sendPPY(txType, challenge, user, ppyAmount) {
    const tx = await this.peerplaysRepository.sendPPYFromReceiverAccount(user.peerplaysAccountId, ppyAmount);

    await this.transactionRepository.create({
      txId: tx.id,
      blockNum: tx.block_num,
      trxNum: tx.trx_num,
      ppyAmountValue: ppyAmount,
      type: txConstants.types[txType],
      userId: user.id,
      challengeId: challenge.id,
      peerplaysFromId: this.config.peerplays.paymentReceiver,
      peerplaysToId: user.peerplaysAccountId
    });
  }

}

module.exports = PaymentsJob;
