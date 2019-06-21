const paypal = require('@paypal/checkout-server-sdk');
const logger = require('log4js').getLogger('payapl.repository');

class PaypalRepository {

  /**
   * @param {PaypalConnection} opts.paypalConnection
   */
  constructor(opts) {
    this.paypalConnection = opts.paypalConnection;
  }

  async verifyPayment(orderID) {
    let request = new paypal.orders.OrdersGetRequest(orderID);

    let order;

    try {
      order = await this.paypalConnection.client().execute(request);
    } catch (err) {
      logger.error(err);
      throw new Error(err.message);
    }

    return order.result;
  }

}

module.exports = PaypalRepository;
