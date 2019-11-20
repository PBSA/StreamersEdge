'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('transactions', 'receiverUserId', {type: Sequelize.INTEGER});
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('transactions', 'receiverUserId');
  }
};