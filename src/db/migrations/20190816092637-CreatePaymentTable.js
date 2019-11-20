'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const {statuses} = require('../../constants/payment');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  orderId: {type: DataTypes.STRING, unique: true},
  amountCurrency: {type: DataTypes.STRING},
  amountValue: {type: DataTypes.DOUBLE},
  ppyAmountValue: {type: DataTypes.DOUBLE},
  status: {type: DataTypes.ENUM(...Object.keys(statuses)), allowNull: false},
  error: {type: DataTypes.STRING},
  txId: {type: DataTypes.STRING},
  blockNumber: {type: DataTypes.INTEGER}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('payments',fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('payments');
  }
};
