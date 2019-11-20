const config = require('config');
const PeerplaysConnection = require('../../src/connections/peerplays.connection');
const buildTx = require('./createTx');

console.log(config.peerplays);

const pee = new PeerplaysConnection({config});

async function run() {
  await pee.connect();
  const tx = await buildTx();
  const res = await new Promise(async (resolve) => {
    await pee.networkAPI.exec('broadcast_transaction_with_callback', [resolve, tx]);
  });
  console.log(res);
}

// eslint-disable-next-line no-process-exit
run().then(() => process.exit(0)).catch((err) => {
  console.error('ERROR', err);
  // eslint-disable-next-line no-process-exit
  process.exit(1);
});
