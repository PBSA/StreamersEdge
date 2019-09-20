'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('verification-tokens', 'email', {type: Sequelize.STRING, defaultValue:''});
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('verification-tokens', 'email');
    return Promise.resolve();
  }
};
