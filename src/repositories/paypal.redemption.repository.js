const {model} = require('../db/models/paypal.redemption.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class PaypalRedemptionRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  createRedemption(userId, {amountCurrency, amountValue, transactionId}) {
    return this.create({
      userId,
      amountCurrency,
      amountValue,
      transactionId
    });
  }

}

module.exports = PaypalRedemptionRepository;
