'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');
const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['pubgId']),
  accountId: {type: DataTypes.STRING},
  name: {type: DataTypes.STRING},
  rank: {type: DataTypes.INTEGER},
  kill: {type: DataTypes.INTEGER},
  health: {type: DataTypes.DOUBLE},
  teamId: {type: DataTypes.INTEGER},
  isWin: {type: DataTypes.BOOLEAN}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('pubg-participants', fields);
  },

  down: (queryInterface) => {
     return queryInterface.dropTable('pubg-participants');
  }
};
