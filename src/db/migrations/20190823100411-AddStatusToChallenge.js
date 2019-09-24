'use strict';
const challengeConstants = require('../../constants/challenge');
const DataTypes = require('sequelize/lib/data-types');

module.exports = {
    up: async (queryInterface) => {
        await queryInterface.addColumn('challenges', 'status', {type: DataTypes.ENUM(Object.keys(challengeConstants.status).map((key) => challengeConstants.status[key]))});
        await queryInterface.addColumn('challenge-invited-users', 'joinedAt', {type:DataTypes.DATE, allowNull:false});
        return Promise.resolve();

    },

    down: async (queryInterface) => {
        await queryInterface.removeColumn('challenge-invited-users', 'joinedAt');
        await queryInterface.removeColumn('challenges', 'status');
        await queryInterface.sequelize.query(`DROP TYPE enum_challenges_status`);
        return Promise.resolve();
    }
};
