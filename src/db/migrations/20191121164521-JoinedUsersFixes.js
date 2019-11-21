'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('joined-users', 'user_challenge_unique_constraint');
    await queryInterface.removeColumn('joined-users', 'joinedAt');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('joined-users', ['userId', 'challengeId'], {
      type: 'unique',
      name: 'user_challenge_unique_constraint'
    });
    await queryInterface.addColumn('joined-users', 'joinedAt', {type: Sequelize.DATE, allowNull: true})
  }
};
