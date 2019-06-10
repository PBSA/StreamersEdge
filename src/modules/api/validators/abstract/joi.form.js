const addressValidator = require('wallet-address-validator');
let baseJoi = require('joi');
/**
 * @type {AppConfig}
 */
const config = require('config');

const bitcoinAddress = (joi) => ({
  name: 'string',
  base: joi.string(),
  language: {
    bitcoinAddress: 'Invalid bitcoin address'
  },
  rules: [{
    name: 'bitcoinAddress',
    validate(params, value, state, options) {
      if (!addressValidator.validate(value, 'BTC', config.bitcoinNetwork)) {
        return this.createError('string.bitcoinAddress', {value}, state, options);
      }

      return value;
    }
  }]
});

baseJoi = baseJoi.extend(bitcoinAddress);

module.exports = baseJoi;
