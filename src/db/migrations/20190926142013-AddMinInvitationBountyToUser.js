'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'minInvitationBounty', {type: Sequelize.DOUBLE, defaultValue: 0.0 });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'minInvitationBounty');
  }
};
