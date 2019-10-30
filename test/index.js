const {listModules, asClass} = require('awilix');
const {getLogger} = require('log4js');
// const { assert } = require('chai');
const {container} = require('./../src/awilix');
const PeerplaysConnection = require('./mock/connections/peerplays.connection.mock');
const SmtpConnection = require('./mock/connections/smtp.connection.mock');
const WebPushConnection = require('./mock/connections/web-push.connection.mock');
const PaypalConnection = require('./mock/connections/paypal.connection.mock');
const CoinmarketcapConnection = require('./mock/connections/coinmarketcap.connection.mock');
const TestDbHelper = require('./modules/api/helpers/test.db.helper');

container.register({
  peerplaysConnection: asClass(PeerplaysConnection),
  smtpConnection: asClass(SmtpConnection),
  webPushConnection: asClass(WebPushConnection),
  paypalConnection: asClass(PaypalConnection),
  coinmarketcapConnection: asClass(CoinmarketcapConnection)
});

describe('ALL TESTS', () => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'local-test') {
    throw new Error('Invalid NODE_ENV. Require NODE_ENV=test');
  }

  const logger = getLogger();

  describe('global', async () => {
    let dbConnection;

    it('init connections', async () => {
      const connections = listModules(['src/connections/*.js']);
      await Promise.all(connections.map(({name}) => new Promise(async (resolve) => {
        try {
          const connection = container.resolve(name.replace(/\.([a-z])/g, (a) => a[1].toUpperCase()));
          await connection.connect();

          if (name === 'db.connection') {
            dbConnection = connection;
            await TestDbHelper.truncateAll({dbConnection});
          }

          resolve();
        } catch (error) {
          logger.error(`${name} connect error`);
          resolve();
        }
      })));
    });
  });

  require('./modules/');

  after(async () => {
    const connections = listModules(['src/connections/*.js']);
    await Promise.all(connections.map(({name}) => new Promise(async (resolve) => {
      try {
        await container.resolve(name.replace(/\.([a-z])/g, (a) => a[1].toUpperCase())).disconnect();
        resolve();
      } catch (error) {
        logger.error(`${name} disconnect error`);
        throw new Error(error);
      }
    })));
  });
});
