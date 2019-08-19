'use strict';
const challengeConstants = require('../../constants/challenge');
const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  name: {type: DataTypes.STRING, allowNull: false},
  startDate: {type: DataTypes.DATE, allowNull: true},
  endDate: {type: DataTypes.DATE, allowNull: true},
  game: {type: DataTypes.STRING, allowNull: false},
  accessRule: {type: DataTypes.ENUM(...Object.keys(challengeConstants.accessRules)), allowNull: false},
  ppyAmount: {type: DataTypes.BIGINT, allowNull: false},
  conditionsText: {type: DataTypes.TEXT, allowNull: true}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('challenges', fields)
  },

  down: (queryInterface) => {
   return queryInterface.dropTable('challenges');
  }
};
