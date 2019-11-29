'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.dropTable('whitelisted-games')
    await queryInterface.dropTable('whitelisted-users')
  },

  down: async (queryInterface) => {
  }
};
