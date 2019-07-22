const constants = require('../../constants.json');

class PaypalConnectionMock {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
  }

  connect() {
  }

  client() {
    return {
      execute: (request) => {
        const orderId = request.path.match(/\/([A-z0-9]+)\?/)[1];
        return constants.modules.api.payments.payPalOrders[orderId];
      }
    };
  }

  disconnect() {
  }

}

module.exports = PaypalConnectionMock;
