'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  token: {type: DataTypes.STRING, unique: true},
  email: {type: DataTypes.STRING, defaultValue: true},
  isActive: {type: DataTypes.BOOLEAN, defaultValue: true}
};

module.exports = {
  up: (queryInterface) => {
      return queryInterface.createTable('email-verification-tokens', fields);

  },

  down: (queryInterface) => {
    return queryInterface.dropTable('email-verification-tokens');
  }
};
