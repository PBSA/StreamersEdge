// const {TransactionBuilder} = require('peerplaysjs-lib');

class PeerplaysRepository {

  /**
   * @param {PeerplaysConnection} opts.peerplaysConnection
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.peerplaysConnection = opts.peerplaysConnection;
    this.config = opts.config;
  }

  async createPeerplaysAccount(name, ownerKey, activeKey) {
    const {account} = await this.peerplaysConnection.request({
      account: {
        name,
        active_key: activeKey,
        memo_key: activeKey,
        owner_key: ownerKey,
        refcode: '',
        referrer: this.config.peerplays.referrer
      }
    });
    return account;
  }

  async sendPPY() {
    // todo: build transaction
  }

}

module.exports = PeerplaysRepository;
