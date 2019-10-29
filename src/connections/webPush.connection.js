const webPush = require('web-push');
const BaseConnection = require('./abstracts/base.connection');

class WebPushConnection extends BaseConnection {
  constructor(opts) {
    super();

    this.config = opts.config;
  }

  connect() {
    const {streamersEdgeServiceEmail, vapid: {publicKey, privateKey}} = this.config;
    webPush.setVapidDetails(`mailto:${streamersEdgeServiceEmail}`, publicKey, privateKey);
  }

  getPublicKey() {
    return this.config.vapid.publicKey;
  }

  /**
   * @param {Object} subscription
   * @param {Object} payload
   */
  sendNotification(subscription, payload) {
    return webPush.sendNotification(subscription, JSON.stringify(payload));
  }

  disconnect() {}

}

module.exports = WebPushConnection;
