'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['userId']),
  name: {type: DataTypes.STRING, allowNull: false},
  game: {type: DataTypes.ENUM, values: ['pubg','fortnite']},
  sourceName: {type: DataTypes.ENUM, values: ['twitch','youtube']},
  embedUrl: {type: DataTypes.STRING, allowNull: false},
  channelId: {type: DataTypes.STRING},
  views: {type: DataTypes.INTEGER, allowNull: true},
  isLive: {type: DataTypes.BOOLEAN},
  startTime: {type: DataTypes.DATE},
  thumbnailUrl: {type: DataTypes.STRING}
};

module.exports = {
  up: (queryInterface) => {
   return queryInterface.createTable('streams', fields);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('streams');
  }
};
