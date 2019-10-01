'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('challenges', 'ppyAmount');
    await queryInterface.addColumn('challenges', 'ppyAmount', {type: Sequelize.DOUBLE, defaultValue: 0.0 });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('challenges', 'ppyAmount');
    await queryInterface.addColumn('challenges', 'ppyAmount', {type: Sequelize.BIGINT, allowNull: false});
  }
};
