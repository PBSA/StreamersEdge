const webPush = require('web-push');
class WebPushConnection {

  constructor() {
    this.keys = {};
    this.notifications = {};
  }

  connect() {}

  generateVapidKeys() {
    const vapidKeys = webPush.generateVAPIDKeys();
    this.keys[vapidKeys.publicKey] = vapidKeys.privateKey;
    this.notifications[vapidKeys.publicKey] = [];

    return vapidKeys;
  }

  /**
   * @param {Object} subscription
   * @param {String} email
   * @param {Object} vapidKeys
   * @param {Object} payload
   */
  async sendNotification(subscription, email, vapidKeys, payload) {
    if (this.keys[vapidKeys.publicKey]) {
      this.notifications[vapidKeys.publicKey].push(payload);
    }
  }

  disconnect() {}

}

module.exports = WebPushConnection;
