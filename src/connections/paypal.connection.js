const paypal = require('@paypal/checkout-server-sdk');
const request = require('request-promise');

class PayoutRequest {

  constructor(body) {
    this.path = '/v1/payments/payouts';
    this.verb = 'POST';
    this.body = body;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

}

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

  async createBatchPayout(senderBatchId, items) {
    const payload = {
      sender_batch_header: {
        sender_batch_id: senderBatchId,
        email_subject: this.config.paypal.payouts.emailSubject,
        email_message: this.config.paypal.payouts.emailMessage
      },
      items: items.map((item) => ({
        recipient_type: item.paypalAccountId ? 'PAYPAL_ID' : 'EMAIL',
        amount: {
          value: item.amountValue,
          currency: item.amountCurrency
        },
        receiver: item.paypalAccountId || item.paypalEmail
      }))
    };

    return await this.client().execute(new PayoutRequest(payload));
  }

  getConnectUrl(returnUrl) {
    const env = this.environment();

    if(returnUrl.includes('localhost')) {
      returnUrl = returnUrl.replace('localhost','127.0.0.1');
    }

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

  async getApprovalUrl(amount, currency) {
    let request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount
          }
        }
      ],
      application_context: {
        return_url:`${this.config.frontendCallbackUrl}/paypal-return`,
        cancel_url:`${this.config.frontendCallbackUrl}/paypal-cancel`
      }
    });

    return (await this.client().execute(request)).result.links.find((link) => link.rel === 'approve').href;
  }

  async captureOrder(orderId) {
    let request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    // Call API with your client and get a response for your call
    let response = await this.client().execute(request);
    return response;
  }

  disconnect() {
  }
}

module.exports = PaypalConnection;
