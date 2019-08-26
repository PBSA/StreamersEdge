'use strict';
const challengeConstants = require('../../constants/challenge');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('challenges', 'status', {type: Sequelize.ENUM(Object.keys(challengeConstants.status).map((key) => challengeConstants.status[key]))});
        return Promise.resolve();

    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('challenges', 'status');
        await queryInterface.sequelize.query(`DROP TYPE enum_challenges_status`);
        return Promise.resolve();
    }
};
