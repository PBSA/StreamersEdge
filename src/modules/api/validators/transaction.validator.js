const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');

class TransactionValidator extends BaseValidator {

  constructor(opts) {
    super();

    this.config = opts.config;
    this.getTransactions = this.getTransactions.bind(this);
  }

  getTransactions() {
    const querySchema = {
      limit: Joi.number().required().max(100),
      skip: Joi.number()
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

}

module.exports = TransactionValidator;
