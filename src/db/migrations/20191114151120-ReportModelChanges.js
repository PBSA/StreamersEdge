'use strict';

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.sequelize.query("ALTER TYPE enum_reports_reason ADD VALUE 'other';");
  },

  down: async (queryInterface) => {
    await queryInterface.sequelize.query("DELETE FROM pg_enum WHERE enumlabel = 'other' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'enum_reports_reason')");
  }
};
