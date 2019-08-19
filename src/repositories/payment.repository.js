const {model} = require('../db/models/payment.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class PaymentRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = PaymentRepository;
