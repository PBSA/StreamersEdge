const addressValidator = require('wallet-address-validator');
let baseJoi = require('joi');
/**
 * @type {AppConfig}
 */
const config = require('config');

const objectId = (joi) => ({
  name: 'string',
  base: joi.string(),
  language: {
    objectId: 'Id has invalid format'
  },
  rules: [{
    name: 'objectId',
    validate(params, value, state, options) {
      if (value.search(/^[0-9a-fA-F]{24}$/) === -1) {
        return this.createError('string.objectId', {value}, state, options);
      }

      return value;
    }
  }]
});

baseJoi = baseJoi.extend(objectId);

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
