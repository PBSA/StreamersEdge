const {listModules, asClass} = require('awilix');
const {getLogger} = require('log4js');
// const { assert } = require('chai');
const {container} = require('./../src/awilix');
const PeerplaysConnection = require('./mock/connections/peerplays.connection.mock');
const SmtpConnection = require('./mock/connections/smtp.connection.mock');
const WebPushConnection = require('./mock/connections/web-push.connection.mock');
const PaypalConnection = require('./mock/connections/paypal.connection.mock');
const CoinmarketcapConnection = require('./mock/connections/coinmarketcap.connection.mock');
const AwsConnection = require('./mock/connections/aws.connection.mock');

container.register({
  peerplaysConnection: asClass(PeerplaysConnection),
  smtpConnection: asClass(SmtpConnection),
  webPushConnection: asClass(WebPushConnection),
  paypalConnection: asClass(PaypalConnection),
  coinmarketcapConnection: asClass(CoinmarketcapConnection),
  awsConnection: asClass(AwsConnection)
});

describe('ALL TESTS', () => {
  if (process.env.NODE_ENV !== 'test' && process.env.NODE_ENV !== 'local-test') {
    throw new Error('Invalid NODE_ENV. Require NODE_ENV=test');
  }

  const logger = getLogger();

  describe('global', () => {
    let dbConnection;

    it('init connections', async () => {
      const connections = listModules(['src/connections/*.js']);
      await Promise.all(connections.map(({name}) => new Promise(async (resolve) => {
        try {
          const connection = container.resolve(name.replace(/\.([a-z])/, (a) => a[1].toUpperCase()));
          await connection.connect();

          if (name === 'db.connection') {
            dbConnection = connection;
          }

          resolve();
        } catch (error) {
          logger.error(`${name} connect error`);
          throw new Error(error);
        }
      })));
    });

    it('clear database', async () => {
      await dbConnection.sequelize.sync({
        force: true
      });
    });
  });

  require('./modules/');

  after(async () => {
    const connections = listModules(['src/connections/*.js']);
    await Promise.all(connections.map(({name}) => new Promise(async (resolve) => {
      try {
        await container.resolve(name.replace(/\.([a-z])/, (a) => a[1].toUpperCase())).disconnect();
        resolve();
      } catch (error) {
        logger.error(`${name} disconnect error`);
        throw new Error(error);
      }
    })));
  });
});
