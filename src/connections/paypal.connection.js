const paypal = require('@paypal/checkout-server-sdk');

class PaypalConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
  }

  connect() {
  }

  client() {
    return new paypal.core.PayPalHttpClient(this.environment());
  }

  environment() {
    let clientId = this.config.paypal.clientId;
    let clientSecret = this.config.paypal.secret;

    return this.config.paypal.environment === 'live' ?
      new paypal.core.LiveEnvironment(clientId, clientSecret) :
      new paypal.core.SandboxEnvironment(clientId, clientSecret);
  }

  disconnect() {
  }
}

module.exports = PaypalConnection;
