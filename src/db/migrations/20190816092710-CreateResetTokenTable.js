'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');
const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  token: {type: DataTypes.STRING, unique: true},
  isActive: {type: DataTypes.BOOLEAN, defaultValue: true}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('reset-tokens', fields);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('reset-tokens');
  }
};
