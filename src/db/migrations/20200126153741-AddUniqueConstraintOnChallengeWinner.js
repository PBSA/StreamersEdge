'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('challenge-winners', ['userId', 'challengeId'], {
      type: 'unique',
      name: 'user_challenge_unique_constraint'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('challenge-winners', 'user_challenge_unique_constraint');
  }
};
