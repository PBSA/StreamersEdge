'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  status: {type: DataTypes.ENUM(['open', 'live', 'resolved', 'paid'])},
  name: {type: DataTypes.STRING, allowNull: false},
  timeToStart: {type: DataTypes.DATE, allowNull: true},
  game: {type: DataTypes.STRING, allowNull: false},
  conditionsText: {type: DataTypes.TEXT, allowNull: true},
  streamLink: {type: DataTypes.STRING, allowNull: true},
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('challenges', fields)
  },

  down: (queryInterface) => {
   return queryInterface.dropTable('challenges');
  }
};
