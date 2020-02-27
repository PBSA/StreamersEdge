const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('../../../errors/validate.error');
const {statuses} = require('../../../constants/payment');
const transactionConstants = require('../../../constants/transaction');

class PaymentValidator extends BaseValidator {

  /**
   * @param {PaymentRepository} opts.paymentRepository
   */
  constructor(opts) {
    super();

    this.paymentRepository = opts.paymentRepository;
    this.validatePurchase = this.validatePurchase.bind(this);
    this.createPayment = this.createPayment.bind(this);
  }

  validatePurchase() {
    const bodySchema = {
      orderId: Joi.string().required().max(254)
    };

    return this.validate(null, bodySchema, async (req, query, {orderId}) => {
      const exists = await this.paymentRepository.model.findOne({
        where: {
          orderId,
          status: statuses.SUCCESS
        }
      });

      if (exists) {
        throw new ValidateError(400, 'Purchase already processed');
      }

      return orderId;
    });
  }

  createPayment() {
    const bodySchema = {
      amount: Joi.number().required(),
      currency: Joi.string().valid(transactionConstants.currencies).required()
    };

    return this.validate(null, bodySchema, (req,query,body) => body);
  }

}

module.exports = PaymentValidator;
