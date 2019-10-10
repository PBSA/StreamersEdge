'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('joined-users', ['userId', 'challengeId'], {
      type: 'unique',
      name: 'user_challenge_unique_constraint'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeConstraint('joined-users', 'user_challenge_unique_constraint');
  }
};
