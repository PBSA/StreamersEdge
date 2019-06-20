const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('../../../errors/validate.error');
const {statuses} = require('../../../constants/payment');

class PaymentValidator extends BaseValidator {

  /**
   * @param {PaymentRepository} opts.paymentRepository
   */
  constructor(opts) {
    super();

    this.paymentRepository = opts.paymentRepository;
    this.validatePurchase = this.validatePurchase.bind(this);
  }

  validatePurchase() {
    const bodySchema = {
      orderId: Joi.string().max(254)
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

}

module.exports = PaymentValidator;
