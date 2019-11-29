'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('joined-users', 'ppyAmount', {type: Sequelize.DOUBLE, allowNull: true});
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('joined-users', 'ppyAmount');
  }
}
