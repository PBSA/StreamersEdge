'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('joined-users', 'participantId');
    await queryInterface.addColumn('joined-users', 'userId', {type: Sequelize.INTEGER})
    await queryInterface.removeColumn('joined-users', 'challengeId');
    await queryInterface.addColumn('joined-users', 'challengeId', {type: Sequelize.INTEGER})
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('joined-users', 'userId');
    await queryInterface.addColumn('joined-users', 'participantId', {type: Sequelize.STRING})
    await queryInterface.removeColumn('joined-users', 'challengeId');
    await queryInterface.addColumn('joined-users', 'challengeId', {type: Sequelize.STRING})
  }
};
