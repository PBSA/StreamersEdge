const Sequelize = require('sequelize');
const {Model} = Sequelize;
const {statuses} = require('../constants/payment');

/**
 * @typedef {Class} PaymentModel
 * @property {Number} id
 * @property {Date} createdAt
 * @property {String} orderId
 * @property {String} amountCurrency
 * @property {Number} amountValue
 * @property {Number} ppyAmountValue
 */
class PaymentModel extends Model {}

module.exports = {
  init: (sequelize) => {
    PaymentModel.init({
      orderId: {type: Sequelize.STRING},
      amountCurrency: {type: Sequelize.STRING},
      amountValue: {type: Sequelize.DOUBLE},
      ppyAmountValue: {type: Sequelize.DOUBLE},
      status: {
        type: Sequelize.ENUM(...Object.keys(statuses)),
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'payment'
    });
  },
  associate: (models) => {
    PaymentModel.belongsTo(models.User.model);
  },
  get model() {
    return PaymentModel;
  }
};
