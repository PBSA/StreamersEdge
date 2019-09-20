'use strict';

const MigrationUtil = require('../../utils/migtation.util');
const profileConstants = require('../../constants/profile');
const DataTypes = require('sequelize/lib/data-types');


const fields = {
  ...MigrationUtil.genericRows(),
  ...MigrationUtil.createForeignFields(['reportedUserId', 'reportedByUserId']),
  reportedUserId: {type: DataTypes.INTEGER},
  reportedByUserId: {type: DataTypes.INTEGER},
  reason: {type: DataTypes.ENUM(Object.keys(profileConstants.reportType).map((key) => profileConstants.reportType[key]))},
  description: {type: DataTypes.STRING},
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
