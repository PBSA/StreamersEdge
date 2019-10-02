'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'paypalEmail', {type: Sequelize.STRING, defaultValue: ''});
    await queryInterface.addColumn('users', 'paypalAccountId', {type: Sequelize.STRING, defaultValue: ''});
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('users', 'paypalEmail');
    await queryInterface.removeColumn('users', 'paypalAccountId');
  }
};
