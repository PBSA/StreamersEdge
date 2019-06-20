const RestError = require('../../../errors/rest.error');
const logger = require('log4js').getLogger('paypal.controller');


class PaymentController {

  /**
   * @param {PaymentService} opts.paymentService
   * @param {PaymentValidator} opts.paymentValidator
   */
  constructor(opts) {
    this.paymentService = opts.paymentService;
    this.paymentValidator = opts.paymentValidator;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes() {
    return [
      /**
       * @api {post} /api/v1/payment Process payment paypal
       * @apiName PayPalPurchase
       * @apiGroup PayPal
       * @apiVersion 0.1.0
       */
      [
        'post', '/api/v1/payment',
        this.paymentValidator.validatePurchase,
        this.processPurchase.bind(this)
      ]
    ];
  }

  async processPurchase(user, orderId) {
    try {
      return this.paymentService.processPayment(user, orderId);
    } catch (e) {
      logger.error(e);
      throw new RestError(e.message, 400);
    }
  }
}

module.exports = PaymentController;
