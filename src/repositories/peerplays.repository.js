const logger = require('log4js').getLogger('peerplays.repository');
const {TransactionBuilder, PrivateKey} = require('peerplaysjs-lib');
const BigNumber = require('bignumber.js');
BigNumber.config({ROUNDING_MODE: BigNumber.ROUND_FLOOR});

class PeerplaysRepository {

  /**
   * @param {PeerplaysConnection} opts.peerplaysConnection
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    this.peerplaysConnection = opts.peerplaysConnection;
    this.config = opts.config;

    this.pKey = PrivateKey.fromWif(this.config.peerplays.paymentAccountWIF);
    this.receiverPKey = PrivateKey.fromWif(this.config.peerplays.paymentReceiverWIF);
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

  async sendPPYFromPaymentAccount(accountId, amount) {
    return this.sendPPY(accountId, amount, this.config.peerplays.paymentAccountID, this.pKey);
  }

  async sendPPYFromReceiverAccount(accountId, amount) {
    return this.sendPPY(accountId, amount, this.config.peerplays.paymentReceiver, this.receiverPKey);
  }

  async sendPPY(accountId, amount, from, pk) {
    amount = new BigNumber(amount).shiftedBy(this.peerplaysConnection.asset.precision).integerValue().toNumber();
    const tr = new TransactionBuilder();
    let result;

    try {
      tr.add_type_operation('transfer', {
        fee: {
          amount: 0,
          asset_id: this.config.peerplays.sendAssetId
        },
        from,
        to: accountId,
        amount: {amount, asset_id: this.config.peerplays.sendAssetId}
      });

      await tr.set_required_fees();
      tr.add_signer(pk, pk.toPublicKey().toPublicKeyString());
      logger.trace('serialized transaction:', JSON.stringify(tr.serialize(), null, 2));
      [result] = await tr.broadcast();
      result.amount = amount;
    } catch (e) {
      logger.error(e.message);
    }

    return result;
  }

  async getAccountId(name) {
    let account;

    try {
      account = await this.peerplaysConnection.dbAPI.exec('get_account_by_name', [name]);
    } catch (e) {
      logger.warn('Peerplays returns error', e.message);
      throw new Error('Fetch account error');
    }

    return account.id;
  }

  async broadcastSerializedTx(tr) {
    return new Promise((success, fail) => {
      this.peerplaysConnection.networkAPI
        .exec('broadcast_transaction_with_callback', [(res) => success(res), tr])
        .catch((error) => fail(error));
    });
  }

}

module.exports = PeerplaysRepository;
