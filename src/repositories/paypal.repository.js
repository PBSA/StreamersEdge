const logger = require('log4js').getLogger('payapl.repository');

class PaypalRepository {

  /**
   * @param {PaypalConnection} opts.paypalConnection
   */
  constructor(opts) {
    this.paypalConnection = opts.paypalConnection;
  }

  async getApprovalUrl(amount, currency) {
    let url;

    try {
      url = await this.paypalConnection.getApprovalUrl(amount, currency);
    }catch(err) {
      logger.error(err);
      throw new Error(err.message);
    }

    return url;
  }

  async verifyPayment(orderID) {
    let order;

    try {
      order = await this.paypalConnection.captureOrder(orderID);
    } catch (err) {
      logger.error(err);
      throw new Error(err.message);
    }

    return order.result;
  }

}

module.exports = PaypalRepository;
