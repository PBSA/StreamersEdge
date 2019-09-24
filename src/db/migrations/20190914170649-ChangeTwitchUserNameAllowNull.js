'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users','twitchUserName',{
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    });
    return Promise.resolve();
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('users','twitchUserName',{
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    });
    return Promise.resolve();
  }
};
