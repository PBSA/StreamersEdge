const RiotRequest = require('riot-lol-api');

class LeagueOfLegendsConnection {

  /**
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.config = opts.config;
    this.riotRequest = new RiotRequest(this.config.leagueOfLegends.apiKey);
  }

  async connect() {}

  async request(realm, method, endpoint) {
    return new Promise((resolve, reject) => {
      this.riotRequest.request(realm, method, endpoint, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(data);
      });
    });
  }

  getRealms() {
    return this.riotRequest.PLATFORMS.map((platform) => platform.toLowerCase());
  }

  disconnect() {}
}

module.exports = LeagueOfLegendsConnection;
