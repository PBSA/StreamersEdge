const {streamersEdgeServiceEmail} = require('config');
const webPush = require('web-push');
const BaseConnection = require('./abstracts/base.connection');

class WebPushConnection extends BaseConnection {

  connect() {}

  generateVapidKeys() {
    return webPush.generateVAPIDKeys();
  }

  /**
   * @param {Object} subscription
   * @param {Object} vapidKeys
   * @param {Object} payload
   */
  async sendNotification(subscription, vapidKeys, payload) {
    
    if(vapidKeys == null) {
      return;
    }

    webPush.setVapidDetails(`mailto:${streamersEdgeServiceEmail}`, vapidKeys.publicKey, vapidKeys.privateKey);
    
    try {
      await webPush.sendNotification(subscription, JSON.stringify(payload));
    }catch(ex) {
      console.log(ex);
    }
  }

  disconnect() {}

}

module.exports = WebPushConnection;
