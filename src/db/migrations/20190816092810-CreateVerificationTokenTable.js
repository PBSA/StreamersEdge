'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  email: { type: DataTypes.STRING, defaultValue: '' },
  token: { type: DataTypes.STRING, unique: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('verification-tokens', fields);

  },

  down: (queryInterface) => {
    return queryInterface.dropTable('verification-tokens');
  }
};
