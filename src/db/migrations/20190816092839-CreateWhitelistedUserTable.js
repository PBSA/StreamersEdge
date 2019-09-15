'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  fromUser: {type: DataTypes.INTEGER, allowNull: false},
  toUser: {type: DataTypes.INTEGER, allowNull: false}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('whitelisted-users', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('whitelisted-users');
  }
};
