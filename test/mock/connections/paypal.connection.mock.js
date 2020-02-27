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
        return constants.modules.api.payments.payPalOrders[request];
      }
    };
  }

  captureOrder(request) {
    return this.client().execute(request);
  }

  disconnect() {
  }

}

module.exports = PaypalConnectionMock;
