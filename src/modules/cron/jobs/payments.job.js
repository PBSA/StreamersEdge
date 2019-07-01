const challengeConstants = require('../../../constants/challenge');
const txConstants = require('../../../constants/transaction');
const BigNumber = require('bignumber.js');

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
    const Winner = await this.userRepository.model.findByPk(Challenge.winnerUserId);

    if (!Winner.peerplaysAccountId) {
      return;
    }

    const reward = new BigNumber(Challenge.ppyAmount).times(this.config.userRewardPercent).toFixed(0);

    const result = await this.peerplaysRepository.sendPPYFromReceiverAccount(Winner.peerplaysAccountId, reward);
    await this.peerplaysRepository.sendPPYFromReceiverAccount(
      this.config.peerplays.feeReceiver,
      new BigNumber(Challenge.ppyAmount).minus(reward)
    );

    await this.saveTx(result, Challenge, Winner);

    Challenge.status = challengeConstants.status.paid;
    await Challenge.save();
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
    await this.saveTx(result, Challenge, creator);

    Challenge.status = challengeConstants.status.paid;
    await Challenge.save();
  }

  async saveTx(tx, Challenge, User) {
    await this.transactionRepository.create({
      txId: tx.id,
      blockNum: tx.block_num,
      trxNum: tx.trx_num,
      ppyAmountValue: Challenge.ppyAmount,
      type: txConstants.types.challengeRefund,
      userId: User.id,
      challengeId: Challenge.id,
      peerplaysFromId: this.config.peerplays.paymentReceiver,
      peerplaysToId: User.peerplaysAccountId
    });
  }

}

module.exports = PaymentsJob;
