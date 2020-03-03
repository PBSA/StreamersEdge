'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');


const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['reportedUserId', 'reportedByUserId']),
  reportedUserId: {type: DataTypes.INTEGER},
  reportedByUserId: {type: DataTypes.INTEGER},
  reason: {type: DataTypes.ENUM([
    'vulgarity-on-stream',
    'sexist-comments-on-stream',
    'offends-my-religious-sentiments',
    'offensive-profile-pic',
    'other'
  ])},
  description: {type: DataTypes.STRING(1000)},
  videoUrl: {type: DataTypes.STRING},
};

module.exports = {
  up: (queryInterface) => {
    return queryInterface.createTable('reports', fields);
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('reports');
  }
};
