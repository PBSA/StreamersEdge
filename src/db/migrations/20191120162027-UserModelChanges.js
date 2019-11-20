'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'invitations');
    await queryInterface.removeColumn('users', 'minInvitationBounty');

    await queryInterface.addColumn('users', 'timeFormat', {type: Sequelize.ENUM(['12h', '24h']), allowNull: false, defaultValue: '12h'});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'timeFormat');
    await queryInterface.addColumn('users', 'minInvitationBounty', {type: Sequelize.DOUBLE, defaultValue: 0.0 });
    await queryInterface.addColumn('users', 'invitations', {type: Sequelize.ENUM(['all', 'none', 'users', 'games'])})
  }
}
