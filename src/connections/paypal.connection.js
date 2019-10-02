const paypal = require('@paypal/checkout-server-sdk');
const request = require('request-promise');

class PaypalConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
    this.errors = {
      INVALID_AUTH_CODE: 'INVALID_AUTH_CODE',
      INCOMPLETE_PROFILE: 'INCOMPLETE_PROFILE'
    };
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

  getConnectUrl(returnUrl) {
    const env = this.environment();

    const url = new URL('/connect', env.webUrl);
    url.search = new URLSearchParams({
      flowEntry: 'static',
      client_id: this.config.paypal.clientId,
      scope: this.config.paypal.openidScopes,
      redirect_uri: returnUrl
    }).toString();

    return url.toString();
  }

  async createAccessToken(code) {
    const env = this.environment();
    const request = new paypal.core.RefreshTokenRequest(env, code);

    try {
      const {result: {access_token}} = await this.client().execute(request);
      return access_token;
    } catch (err) {
      if (err.error && err.error === 'access_denied') {
        throw new Error(this.errors.INVALID_AUTH_CODE);
      } else {
        throw err;
      }
    }
  }

  async getUserInfo(accessToken) {
    const env = this.environment();
    const url = `${env.baseUrl}/v1/identity/oauth2/userinfo?schema=paypalv1.1`;

    const result = await request({
      url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      json: true
    });

    if (!result.payer_id || !result.emails) {
      throw new Error(this.errors.INCOMPLETE_PROFILE);
    }

    const paypalAccountId = result.payer_id;

    let paypalEmail = result.emails.find((email) => email.primary);

    if (!paypalEmail) {
      throw new Error(this.errors.INCOMPLETE_PROFILE);
    }

    paypalEmail = paypalEmail.value;

    return {
      paypalAccountId,
      paypalEmail
    };
  }

  disconnect() {
  }
}

module.exports = PaypalConnection;
