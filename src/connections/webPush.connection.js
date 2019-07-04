const webPush = require('web-push');
const BaseConnection = require('./abstracts/base.connection');


class WebPushConnection extends BaseConnection {

  connect() {}

  generateVapidKeys() {
    return webPush.generateVAPIDKeys();
  }

  /**
   * @param {Object} subscription
   * @param {String} email
   * @param {Object} vapidKeys
   * @param {Object} payload
   */
  async sendNotificaton(subscription, email, vapidKeys, payload) {
    webPush.setVapidDetails(`mailto:${email}`, vapidKeys.publicKey, vapidKeys.privateKey);
    await webPush.sendNotification(subscription, JSON.stringify(payload));
  }

  disconnect() {}

}

module.exports = WebPushConnection;
