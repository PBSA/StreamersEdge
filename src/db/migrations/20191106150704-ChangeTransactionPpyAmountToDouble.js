'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('transactions', 'ppyAmountValue', {type: Sequelize.DOUBLE});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('transactions', 'ppyAmountValue', {type: Sequelize.INTEGER});
  }
};
