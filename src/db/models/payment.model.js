const Sequelize = require('sequelize');
const {Model} = Sequelize;
const {statuses} = require('../../constants/payment');

/**
 * @typedef {Class} PaymentModel
 * @property {Number} id
 * @property {Date} createdAt
 * @property {String} orderId
 * @property {String} amountCurrency
 * @property {Number} amountValue
 * @property {Number} ppyAmountValue
 * @property {String} status
 * @property {String} error
 * @property {String} txId
 * @property {Number} blockNumber
 */
class PaymentModel extends Model {}


module.exports = {
  init: (sequelize) => {
    PaymentModel.init({
      orderId: {
        type: Sequelize.STRING,
        unique: true
      },
      amountCurrency: {type: Sequelize.STRING},
      amountValue: {type: Sequelize.DOUBLE},
      ppyAmountValue: {type: Sequelize.DOUBLE},
      status: {
        type: Sequelize.ENUM(...Object.keys(statuses)),
        allowNull: false
      },
      error: {type: Sequelize.STRING},
      txId: {type: Sequelize.STRING},
      blockNumber: {type: Sequelize.INTEGER}
    }, {
      sequelize,
      modelName: 'payments'
    });
  },
  associate: (models) => {
    PaymentModel.belongsTo(models.User.model);
  },
  get model() {
    return PaymentModel;
  }
};
