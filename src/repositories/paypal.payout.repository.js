const {model} = require('../db/models/paypal.payout.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class PaypalPayoutRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = PaypalPayoutRepository;
