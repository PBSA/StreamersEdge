const pubg = require('pubg.js');

class PubgConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
  }

  async connect() {
    this.client = new pubg.Client(this.config.pubg.apiKey);
  }

  disconnect() {}
}

module.exports = PubgConnection;
