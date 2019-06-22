const constants = require('../../constants.json');

class PeerplaysConnectionMock {

  connect() {}

  async request(form) {
    if (form.account.name !== constants.modules.api.profile.validPeerplaysName) {
      throw new Error('Invalid account name');
    }

    return {
      account: {
        name: form.account.name,
        owner_key: form.account.ownerKey,
        active_key: form.account.activeKey,
        memo_key: form.account.activeKey,
        referrer: form.account.name
      }
    };
  }

  disconnect() {}

}

module.exports = PeerplaysConnectionMock;
