'use strict';

module.exports = {
  up: async (queryInterface) => {
    return queryInterface.sequelize.query("ALTER TYPE enum_transactions_type ADD VALUE 'redeem';");
  },

  down: async (queryInterface) => {
    return queryInterface.sequelize.query("DELETE FROM pg_enum WHERE enumlabel = 'redeem' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_transactions_type')");
  }
};
