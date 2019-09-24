'use strict';
const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId', 'bannedById', 'unbannedById']),

  unbanDate:{type: DataTypes.DATE, allowNull: true}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('ban-histories', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('ban-histories');
  }
};
