'use strict';
const allowedGames = require('../../constants/games');

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  fromGame: {type: DataTypes.ENUM(...Object.keys(allowedGames.games)), allowNull: false},
  toUser: {type: DataTypes.INTEGER, allowNull: false}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('whitelisted-games', fields);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('whitelisted-games');
  }
};
