'use strict';
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
    ...MigrationUtil.genericRows(),
    ...MigrationUtil.createForeignFields(['challengeId', 'userId']),
};
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('challenge-winners', fields);

    await queryInterface.addConstraint('challenge-winners', ['userId', 'challengeId'], {
      type: 'unique',
      name: 'challenge_winners_unique_constraint'
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('challenge-winners');
  }
};
