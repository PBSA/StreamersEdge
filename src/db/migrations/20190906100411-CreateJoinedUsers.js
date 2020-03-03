'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
  ...MigrationUtil.genericRows(),
  challengeId: {type: DataTypes.INTEGER},
  userId: {type: DataTypes.INTEGER},
  ppyAmount: {type: DataTypes.DOUBLE, allowNull: true},
  isPayed: {type: DataTypes.BOOLEAN},
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('joined-users', fields);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('joined-users');
  }
};
