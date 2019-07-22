const paypal = require('@paypal/checkout-server-sdk');

class PaypalConnectionMock {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
  }

  connect() {}

  client() {
    return new paypal.core.PayPalHttpClient(this.environment());
  }

  environment() {
    const clientId = this.config.paypal.clientId;
    const clientSecret = this.config.paypal.secret;

    return new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }

  disconnect() {}

}

module.exports = PaypalConnectionMock;
