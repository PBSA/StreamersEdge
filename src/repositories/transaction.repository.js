const {model} = require('../models/transaction.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class TransactionRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  async searchTransactions(userId, limit, offset) {
    return this.model.findAll({
      where: {userId},
      offset,
      limit
    });
  }

}

module.exports = TransactionRepository;
