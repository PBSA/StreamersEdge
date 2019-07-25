const assert = require('assert');
const constants = require('../../constants.json');

class TransactionBuilderMock {
  /**
   * @param {PeerplaysConnectionMock} connection
   */
  constructor(connection) {
    this.connection = connection;
    this.method = null;
    this.params = null;
    this.signed = false;
  }

  add_type_operation(method, params) {
    this.method = method;
    this.params = params;
  }

  set_required_fees() {
    this.params.fee.amount = 123;
  }

  add_signer() {
    this.signed = true;
  }

  async broadcast() {
    assert(this.signed);
    assert(this.connection.balances[this.params.from] > this.params.amount.amount);
    this.connection.balances[this.params.to] += this.params.amount.amount;
    this.connection.balances[this.params.from] -= this.params.amount.amount;
    return [{amount: this.params.amount.amount}];
  }

  serialize() {
    return this.params;
  }
}

class PeerplaysConnectionMock {

  constructor ({config}) {
    this._accounts = {'1.2.0': {}};
    this._accountIdByName = {};
    this._accountsCount = 0;
    this.asset = {precision: 5};
    this.balances = {[config.peerplays.paymentAccountID]: 1e10};
    this.dbAPI = {
      exec: (method, args) => {

        switch (method) {
          case 'get_account_by_name':
            if (!this._accountIdByName[args[0]]) {
              this._accountIdByName[args[0]] = `1.2.${this._accountsCount}`;
              this._accountsCount += 1;
            }

            return Promise.resolve({id: this._accountIdByName[args[0]]});
          default:
            throw new Error('method not allowed');
        }
      }
    };
    this.TransactionBuilder = TransactionBuilderMock.bind(null, this);
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
