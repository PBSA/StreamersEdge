'use strict';
const UserFactory = require('../factories/user.factory');

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.bulkInsert('users', [
      await UserFactory.generateObject({}),
      await UserFactory.generateObject({}),
      await UserFactory.generateObject({})
    ], {});


  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('users', null, {});
  }
};
