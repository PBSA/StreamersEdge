'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');
const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['leagueOfLegendsMatchId']),
  accountId: {type: DataTypes.STRING},
  summonerName: {type: DataTypes.STRING},
  summonerId: {type: DataTypes.STRING},
  kills: {type: DataTypes.INTEGER},
  isWin: {type: DataTypes.BOOLEAN}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('leagueoflegends-participants', fields);
  },

  down: (queryInterface) => {
     return queryInterface.dropTable('leagueoflegends-participants');
  }
};
