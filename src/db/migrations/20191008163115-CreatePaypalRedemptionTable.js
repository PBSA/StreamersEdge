'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId', 'paypalPayoutId', 'transactionId']),
  amountCurrency: {type: DataTypes.STRING},
  amountValue: {type: DataTypes.DOUBLE}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('paypal-redemptions', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('paypal-redemptions');
  }
};
