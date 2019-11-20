'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
  ...MigrationUtil.genericRows(),
  gameId: {type: DataTypes.STRING, unique: true},
  realm: {type: DataTypes.STRING},
  createdAt: {type: DataTypes.DATE},
  gameDuration: {type: DataTypes.INTEGER},
  gameMode: {type: DataTypes.STRING},
  gameType: {type: DataTypes.STRING},
  mapId: {type: DataTypes.INTEGER},
  seasonId: {type: DataTypes.INTEGER},
  queueId: {type: DataTypes.INTEGER},
  platformId: {type: DataTypes.STRING}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('leagueoflegends-matches', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('leagueoflegends-matches');
  }
};
