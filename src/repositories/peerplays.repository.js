class PeerplaysRepository {

  /**
   * @param {PeerplaysConnection} opts.peerplaysConnection
   */
  constructor(opts) {
    this.peerplaysConnection = opts.peerplaysConnection;
  }

  async createPeerplaysAccount(name, ownerKey, activeKey) {
    const {account} = await this.peerplaysConnection.request({
      account: {
        name,
        active_key: activeKey,
        memo_key: activeKey,
        owner_key: ownerKey
      }
    });
    return account;
  }

}

module.exports = PeerplaysRepository;
