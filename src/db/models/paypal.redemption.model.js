const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} PaypalRedemptionModel
 * @property {Number} id
  * @property {Number} userId
 */
class PaypalRedemptionModel extends Model {}


module.exports = {
  init: (sequelize) => {
    PaypalRedemptionModel.init({
      amountCurrency: {type: Sequelize.STRING},
      amountValue: {type: Sequelize.DOUBLE}
    }, {
      sequelize,
      modelName: 'paypal-redemptions'
    });
  },
  associate: (models) => {
    PaypalRedemptionModel.belongsTo(models.User.model);
    PaypalRedemptionModel.belongsTo(models.Transaction.model);
    PaypalRedemptionModel.belongsTo(models.PaypalPayout.model);
  },
  get model() {
    return PaypalRedemptionModel;
  }
};
