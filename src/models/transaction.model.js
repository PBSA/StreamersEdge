const Sequelize = require('sequelize');
const {Model} = Sequelize;
const {types} = require('../constants/transaction');

/**
 * @typedef {Class} TransactionModel
 * @property {Number} id
 * @property {Date} createdAt
 * @property {String} txId
 * @property {String} amountCurrency
 * @property {Number} blockNum
 * @property {Number} trxNum
 * @property {Number} ppyAmountValue
 * @property {String} type
 * @property {Number} userId
 * @property {Number} challengeId
 */
class TransactionModel extends Model {
  getPublic() {
    return this.toJSON();
  }
}

module.exports = {
  init: (sequelize) => {
    TransactionModel.init({
      txId: {
        type: Sequelize.STRING,
        unique: true
      },
      blockNum: {type: Sequelize.INTEGER},
      trxNum: {type: Sequelize.INTEGER},
      ppyAmountValue: {type: Sequelize.INTEGER},
      type: {type: Sequelize.ENUM(Object.keys(types).map((key) => types[key]))}
    }, {
      sequelize,
      modelName: 'transaction'
    });
  },
  associate: (models) => {
    TransactionModel.belongsTo(models.User.model);
    TransactionModel.belongsTo(models.Challenge.model);
  },
  get model() {
    return TransactionModel;
  }
};
