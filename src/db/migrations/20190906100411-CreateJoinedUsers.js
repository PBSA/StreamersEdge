'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
    ...MigrationUtil.genericRows(),
    challengeId: {type: DataTypes.STRING, unique: true},
    participantId: {type: DataTypes.STRING, unique: true},
    joinedAt: {type: DataTypes.DATE},
    isPayed: {type: DataTypes.BOOLEAN},
};

module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable('joined-users', fields)
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('joined-users');
    }
};
