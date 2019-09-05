'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');
const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  sid: {type: DataTypes.STRING(36), unique: true, defaultValue: true},
  expires: {type: DataTypes.DATE},
  data: {type: DataTypes.TEXT}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('Sessions', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('Sessions');
  }
};
