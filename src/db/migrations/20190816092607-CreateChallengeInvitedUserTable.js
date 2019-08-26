'use strict';
const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
    ...MigrationUtil.genericRows(),
    ...MigrationUtil.createForeignFields(['challengeId', 'userId']),
    joinedAt: {type: DataTypes.DATE, allowNull: false}
};
module.exports = {
  up: (queryInterface) => {
   return queryInterface.createTable('challenge-invited-users', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('challenge-invited-users')
  }
};
