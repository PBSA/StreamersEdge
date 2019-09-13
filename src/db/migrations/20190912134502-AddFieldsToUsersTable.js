'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'peerplaysMasterPassword', {type: Sequelize.STRING, defaultValue:''});
    return Promise.resolve();

  },

  down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('users', 'peerplaysMasterPassword');
      return Promise.resolve();
  },
};