'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query("ALTER TABLE users ALTER \"userType\" SET DEFAULT 'viewer'");
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query("ALTER TABLE users ALTER \"userType\" DROP DEFAULT");
  }
}
