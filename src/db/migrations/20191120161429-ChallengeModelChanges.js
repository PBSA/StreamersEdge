'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('challenges', 'startDate');
    await queryInterface.removeColumn('challenges', 'endDate');
    await queryInterface.removeColumn('challenges', 'accessRule');
    await queryInterface.removeColumn('challenges', 'ppyAmount');

    await queryInterface.addColumn('challenges', 'timeToStart', {type: Sequelize.DATE, allowNull: true});
    await queryInterface.addColumn('challenges', 'streamLink', {type: Sequelize.STRING, allowNull: true});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('challenges', 'timeToStart');
    await queryInterface.removeColumn('challenges', 'streamLink');

    await queryInterface.addColumn('challenges', 'startDate', {type: Sequelize.DATE, allowNull: false});
    await queryInterface.addColumn('challenges', 'endDate', {type: Sequelize.DATE, allowNull: false});
    await queryInterface.addColumn('challenges', 'accessRule', {type: Sequelize.ENUM(['invite', 'anyone']), allowNull: false});
    await queryInterface.addColumn('challenges', 'ppyAmount', {type: Sequelize.DOUBLE, allowNull: false});
  }
}

