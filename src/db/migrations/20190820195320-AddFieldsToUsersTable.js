'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'vapidKey', {type: Sequelize.JSON});
    await queryInterface.addColumn('users', 'challengeSubscribeData',
      {type: Sequelize.JSON});
    return Promise.resolve();

  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('users', 'challengeSubscribeData');
      await queryInterface.removeColumn('users', 'vapidKey');
      return Promise.resolve();
  },
};
