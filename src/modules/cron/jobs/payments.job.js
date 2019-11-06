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
      await this.payToWinners(challenge, winners);
      return;
    }

    const joined = await this.joinedUsersRepository.model.findOne({
      where: {challengeId: challenge.id}
    });

    if (joined) {
      await this.payToOwner(challenge);
    } else {
      await this.payToCreator(challenge);
    }
  }

  async payToWinners(challenge, winners) {
    const users = await this.userRepository.findByPkList(winners.map(({userId}) => userId));
    
    const totalReward = challenge.ppyAmount * this.config.challenge.userRewardPercent;
    const winnerReward = totalReward / users.length;
    const fee = challenge.ppyAmount - totalReward;

    await Promise.all(users.map((user) => this.sendPPY('challengeReward', challenge, user, winnerReward)));
    await this.peerplaysRepository.sendPPYFromReceiverAccount(this.config.peerplays.feeReceiver, fee);

    challenge.status = challengeConstants.status.paid;
    await challenge.save();
  }

  async payToOwner(challenge) {
    await this.peerplaysRepository.sendPPYFromReceiverAccount(this.config.peerplays.feeReceiver, challenge.ppyAmount);

    challenge.status = challengeConstants.status.paid;
    await challenge.save();
  }

  async payToCreator(challenge) {
    const creator = await this.userRepository.model.findByPk(challenge.userId);
    await this.sendPPY('challengeRefund', challenge, creator, challenge.ppyAmount);

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
