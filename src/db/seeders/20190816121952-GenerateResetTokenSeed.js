'use strict';
const ResetTokenFactory = require('../factories/reset-token.factory');

module.exports = {
  up: (queryInterface) => {
    return queryInterface.bulkInsert('reset-tokens', [
      ResetTokenFactory.generateObject({}),
      ResetTokenFactory.generateObject({}),
      ResetTokenFactory.generateObject({}),
      ResetTokenFactory.generateObject({})
    ]);
  },

  down: (queryInterface) => {
    return queryInterface.bulkDelete('reset-tokens', null, {});
  }
};
