const {model} = require('../db/models/transaction.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class TransactionRepository extends BasePostgresRepository {

  constructor(opts) {
    super(model);
    this.peerplaysRepository = opts.peerplaysRepository;
  }

  async searchTransactions(userId, limit, offset) {
    return this.model.findAll({
      where: {userId},
      offset,
      limit
    });
  }

  async isTransactionConfirmed(transactionId) {
    const transaction = await this.model.findOne({
      where: {
        id: transactionId
      }
    });

    if(!transaction) {
      return false;
    }

    return await this.peerplaysRepository.isTransactionConfirmed(transaction.trxNum, transaction.blockNum,
      transaction.peerplaysFromId, transaction.peerplaysToId, transaction.ppyAmountValue);
  }

}

module.exports = TransactionRepository;
