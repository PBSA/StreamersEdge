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
    this.connection.balances[this.params.to] += this.params.amount.amount;
    this.connection.balances[this.params.from] -= this.params.amount.amount;
    return [{
      amount: this.params.amount.amount,
      trx: {
        operations: [[0, {
          from: this.params.from,
          to: this.params.to,
          amount: this.params.amount
        }]]
      }
    }];
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

    this.id = '8037d9f02e76eccbca449ae6a6e42294090bc9d7';
    this.block_num = 1416474;
    this.trx_num = 0;

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
    this.networkAPI = {
      exec: async (method, [cb, tx])  => {
        const arr = [ {
          id: Math.random().toString(36).substring(7),//this.id,
          block_num: this.block_num,
          trx_num: this.trx_num,
          trx: tx
        } ];

        switch(method) {
          case 'broadcast_transaction_with_callback':
            setTimeout(() => cb(arr), 1);
            return arr;
          default:
            throw new Error('method not allowed');
        }
      }
    };

    this.TransactionBuilder = TransactionBuilderMock.bind(null, this);
  }

  connect() {}

  async request(form) {

    if (form.account.name !== constants.modules.api.profile.validPeerplaysName && !form.account.name.startsWith('se-')) {
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
