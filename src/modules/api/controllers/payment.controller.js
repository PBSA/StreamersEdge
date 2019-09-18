const RestError = require('../../../errors/rest.error');

/**
 * @swagger
 *
 * definitions:
 *  PaymentPaypal:
 *    type: object
 *    required:
 *      - orderId
 *    properties:
 *      orderId:
 *        type: string
 *
 *  PaymentResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            $ref: '#/definitions/Payment'
 *
 *  Payment:
 *    type: object
 *    properties:
 *      id:
 *        type: number
 *      userId:
 *        type: number
 *      orderId:
 *        type: string
 *      amountCurrency:
 *        type: string
 *      amountValue:
 *        type: number
 *      ppyAmountValue:
 *        type: number
 *      status:
 *        type: string
 *      error:
 *        type: string
 *      txId:
 *        type: number
 *      blockNumber:
 *        type: number
 *      updatedAt:
 *        type: string
 *      createdAt:
 *        type: string
 */

class PaymentController {

  /**
   * @param {AuthValidator} opts.authValidator
   * @param {PaymentService} opts.paymentService
   * @param {PaymentValidator} opts.paymentValidator
   * @param {AuthValidator} opts.authValidator
   */
  constructor(opts) {
    this.paymentService = opts.paymentService;
    this.authValidator = opts.authValidator;
    this.paymentValidator = opts.paymentValidator;
  }

  /**
   * Array of routes processed by this controller
   * @returns {*[]}
   */
  getRoutes() {
    return [
      /**
       * @swagger
       *
       * /payment:
       *  post:
       *    description: Process payment paypal
       *    summary: Make payment
       *    produces:
       *      - application/json
       *    tags:
       *      - Payment
       *    parameters:
       *      - name: payment
       *        in: body
       *        required: true
       *        schema:
       *          $ref: '#/definitions/PaymentPaypal'
       *    responses:
       *      200:
       *        description: Payment response
       *        schema:
       *          $ref: '#/definitions/PaymentResponse'
       *      401:
       *        description: Error user unauthorized
       *        schema:
       *          $ref: '#/definitions/UnauthorizedError'
       *      400:
       *        description: Error form validation
       *        schema:
       *          $ref: '#/definitions/ValidateError'
       *
       */
      [
        'post', '/api/v1/payment',
        this.authValidator.loggedOnly,
        this.paymentValidator.validatePurchase,
        this.processPurchase.bind(this)
      ]
    ];
  }

  async processPurchase(user, orderId) {
    try {
      return await this.paymentService.processPayment(user, orderId);
    } catch (e) {
      throw new RestError(e.message, 400);
    }
  }
}

module.exports = PaymentController;
