'use strict';
const MigrationUtil = require('../../utils/migtation.util');
const DataTypes = require('sequelize/lib/data-types');

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('challenges', 'winnerUserId', {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'users',
            schema: 'schema'
          },
          key: 'id'
        },
        allowNull: true
      });
    return Promise.resolve();
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('challenges', 'winnerUserId');
  }
};
