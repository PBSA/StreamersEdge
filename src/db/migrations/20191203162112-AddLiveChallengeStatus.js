'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query("ALTER TYPE enum_challenges_status ADD VALUE 'live';");
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query("DELETE FROM pg_enum WHERE enumlabel = 'live' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_challenges_status')");
  }
};
