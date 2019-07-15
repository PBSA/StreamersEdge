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

  async sendPPY(accountId, amount) {
    amount = new BigNumber(amount).shiftedBy(this.peerplaysConnection.asset.precision).integerValue().toNumber();
    const tr = new TransactionBuilder();
    let result;

    try {
      tr.add_type_operation('transfer', {
        fee: {
          amount: 0,
          asset_id: this.config.peerplays.sendAssetId
        },
        from: this.config.peerplays.paymentAccountID,
        to: accountId,
        amount: {amount, asset_id: this.config.peerplays.sendAssetId}
      });

      await tr.set_required_fees();
      tr.add_signer(this.pKey, this.pKey.toPublicKey().toPublicKeyString());
      logger.trace('serialized transaction:', JSON.stringify(tr.serialize(), null, 2));
      [result] = await tr.broadcast();
      result.amount = amount;
    } catch (e) {
      logger.error(e.message);
      throw e;
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
