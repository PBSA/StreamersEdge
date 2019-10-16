const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('../../../errors/validate.error');
const operationSchema = require('./abstract/operation.schema');

class TransactionValidator extends BaseValidator {

  constructor(opts) {
    super();

    this.config = opts.config;
    this.getTransactions = this.getTransactions.bind(this);
    this.donate = this.donate.bind(this);
    this.redeem = this.redeem.bind(this);
    this.userRepository = opts.userRepository;
  }

  getTransactions() {
    const querySchema = {
      limit: Joi.number().required().min(1).max(100).default(20),
      skip: Joi.number().integer().min(0).default(0)
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

  donate() {
    const bodySchema = {
      receiverId: Joi.number().integer().required(),
      ppyAmount: Joi.number(),
      donateOp: operationSchema
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {receiverId, donateOp, ppyAmount} = body;

      if (req.user.id === receiverId) {
        throw new ValidateError(400, 'Validate error', {
          email: 'There are no chance to donate on your account'
        });
      }

      const receiver = await this.userRepository.findByPk(receiverId);

      if (!receiver) {
        throw new ValidateError(404, 'Validate error', {
          email: 'This user does not exist'
        });
      }

      if (!donateOp && !ppyAmount) {
        const errorMsg = 'Either donateOp or ppyAmount must be set';
        throw new ValidateError(400, errorMsg, {
          donateOp: errorMsg,
          ppyAmount: errorMsg
        });
      }

      return {receiverId, donateOp, ppyAmount};
    });
  }

  redeem() {
    const bodySchema = {
      ppyAmount: Joi.number(),
      redeemOp: operationSchema
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {redeemOp, ppyAmount} = body;

      if (!redeemOp && !ppyAmount) {
        const errorMsg = 'Either redeemOp or ppyAmount must be set';
        throw new ValidateError(400, errorMsg, {
          redeemOp: errorMsg,
          ppyAmount: errorMsg
        });
      }

      return {redeemOp, ppyAmount};
    });
  }

}

module.exports = TransactionValidator;
