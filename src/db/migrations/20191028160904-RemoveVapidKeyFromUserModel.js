'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'vapidKey');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'vapidKey', {type: Sequelize.JSON});
  }
};
