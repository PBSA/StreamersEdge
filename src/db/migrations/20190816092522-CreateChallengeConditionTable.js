'use strict';
const MigrationUtil = require('../../utils/migtation.util');
const {operators, joinTypes} = require('../../constants/challenge');
const DataTypes = require('sequelize/lib/data-types');

const fields = {
    ...MigrationUtil.genericRows(),
    ...MigrationUtil.createForeignFields(['challengeId']),
    param: {type: DataTypes.STRING, allowNull: false},
    operator: {type: DataTypes.ENUM(operators),allowNull: false},
    value: {type: DataTypes.INTEGER, allowNull: true},
    join: {type: DataTypes.ENUM(joinTypes), allowNull: true},
    challengeId: {type: DataTypes.INTEGER}
};

module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable('challenge-conditions', fields)
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('challenge-conditions')
    }
};
