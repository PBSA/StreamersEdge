'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const {types} = require('../../constants/transaction');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['challengeId', 'userId']),
  txId: {type: DataTypes.STRING, unique: true},
  blockNum: {type: DataTypes.INTEGER},
  trxNum: {type: DataTypes.INTEGER},
  ppyAmountValue: {type: DataTypes.INTEGER},
  type: {type: DataTypes.ENUM(Object.keys(types).map((key) => types[key]))},
  peerplaysFromId: {type: DataTypes.STRING},
  peerplaysToId: {type: DataTypes.STRING}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('transactions', fields);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('transactions');
  }
};
