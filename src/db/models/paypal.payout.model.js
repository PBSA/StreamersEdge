const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} PaypalPayoutModel
 * @property {Number} id
 */
class PaypalPayoutModel extends Model {}


module.exports = {
  init: (sequelize) => {
    PaypalPayoutModel.init({
      senderBatchId: {type: Sequelize.STRING},
      payoutBatchId: {type: Sequelize.STRING}
    }, {
      sequelize,
      modelName: 'paypal-payouts'
    });
  },
  associate: (models) => {
    PaypalPayoutModel.hasMany(models.PaypalRedemption.model);
  },
  get model() {
    return PaypalPayoutModel;
  }
};
