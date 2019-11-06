const Sequelize = require('sequelize');
const {Model} = Sequelize;
const {types} = require('../../constants/transaction');

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
 * @property {Number} peerplaysFromId
 * @property {Number} peerplaysFromId
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
      ppyAmountValue: {type: Sequelize.DOUBLE},
      type: {type: Sequelize.ENUM(Object.keys(types).map((key) => types[key]))},
      peerplaysFromId: {type: Sequelize.STRING},
      peerplaysToId: {type: Sequelize.STRING},
      receiverUserId: {type: Sequelize.INTEGER}
    }, {
      sequelize,
      modelName: 'transactions'
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
