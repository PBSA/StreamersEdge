'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
  ...MigrationUtil.genericRows(),
  pubgId: {type: DataTypes.STRING, unique: true},
  createdAt: {type: DataTypes.DATE},
  duration: {type: DataTypes.INTEGER},
  gameMode: {type: DataTypes.STRING},
  mapName: {type: DataTypes.STRING},
  isCustomMatch: {type: DataTypes.BOOLEAN},
  shardId: {type: DataTypes.STRING},
  titleId: {type: DataTypes.STRING}
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('pubgs', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('pubgs');
  }
};
