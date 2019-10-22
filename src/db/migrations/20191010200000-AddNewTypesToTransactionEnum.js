'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query("ALTER TYPE enum_transactions_type ADD VALUE 'challengeRefund';");
    await queryInterface.sequelize.query("ALTER TYPE enum_transactions_type ADD VALUE 'challengeReward';");
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query("DELETE FROM pg_enum WHERE enumlabel = 'challengeRefund' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_transactions_type')");
    await queryInterface.sequelize.query("DELETE FROM pg_enum WHERE enumlabel = 'challengeReward' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_transactions_type')");
  }
};
