const {TransactionBuilder, PrivateKey, ChainConfig, Apis} = require('peerplaysjs-lib');
const config = require('config');

ChainConfig.setPrefix('TEST');

const privateKey = PrivateKey.fromWif(config.peerplays.paymentAccountWIF);
let tr = new TransactionBuilder();

const buildTx = async () => {
  await Apis.instance(config.peerplays.peerplaysWS, true).init_promise;
  tr.add_type_operation('transfer', {
    fee: {
      amount: 0,
      asset_id: '1.3.0'
    },
    from: config.peerplays.paymentAccountID,
    to: config.peerplays.paymentReceiver,
    amount: {amount: 100, asset_id: '1.3.0'}
  });
  await tr.set_required_fees();
  await tr.add_signer(privateKey, privateKey.toPublicKey().toPublicKeyString());
  tr.set_expire_seconds(parseInt(new Date().getTime() / 1000) + 100);
  await tr.finalize();
  tr.sign();
  console.log('serialized transaction:', JSON.stringify(tr.serialize(), null, 2));
};

buildTx().catch((e) => console.log(e));