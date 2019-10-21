'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'leagueOfLegendsAccountId', {type: Sequelize.STRING, allowNull: true });
    await queryInterface.addColumn('users', 'leagueOfLegendsRealm', {type: Sequelize.STRING, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'leagueOfLegendsAccountId');
    await queryInterface.removeColumn('users', 'leagueOfLegendsRealm');
  }
};
