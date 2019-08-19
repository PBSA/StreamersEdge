'use strict';
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
    ...MigrationUtil.genericRows(),
    ...MigrationUtil.createForeignFields(['challengeId', 'userId'])
};
module.exports = {
  up: (queryInterface) => {
   return queryInterface.createTable('challenge-invited-users', fields)
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('challenge-invited-users')
  }
};
