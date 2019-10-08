'use strict';
const DataTypes = require('sequelize/lib/data-types');
const MigrationUtil = require('../../utils/migtation.util');

const fields = {
    ...MigrationUtil.genericRows(),
    senderBatchId: {type: DataTypes.STRING, unique: true},
    payoutBatchId: {type: DataTypes.STRING, unique: true}
};

module.exports = {
    up: (queryInterface) => {
        return queryInterface.createTable('paypal-payouts', fields)
    },

    down: (queryInterface) => {
        return queryInterface.dropTable('paypal-payouts');
    }
};
