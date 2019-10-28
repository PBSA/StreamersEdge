class WebPushConnection {

  constructor() {
    this.notifications = {};
  }

  connect() {}

  /**
   * @param {Object} subscription
   * @param {Object} payload
   */
  async sendNotification(subscription, payload) {
    if (!subscription) {
      return;
    }

    const {endpoint} = subscription;

    if (!this.notifications[endpoint]) {
      this.notifications[endpoint] = [];
    }

    this.notifications[endpoint].push(payload);
  }

  disconnect() {}

}

module.exports = WebPushConnection;
