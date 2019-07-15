const constants = require('../../constants.json');

class PeerplaysConnectionMock {

  constructor() {
    this.dbAPI = {
      exec: (method) => {
        if (method === 'get_account_by_name') {
          return {id: '1.2.999'};
        }
      }
    };
  }


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
