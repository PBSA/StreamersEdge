const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} VerificationTokenModel
 * @property {Number} id
 * @property {String} userId
 * @property {String} token
 * @property {Boolean} isActive
 */
class VerificationTokenModel extends Model {}

module.exports = {
  init: (sequelize) => {
    VerificationTokenModel.init({
      token: {
        type: Sequelize.STRING,
        unique: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    }, {
      sequelize,
      modelName: 'verification-token'
    });
  },
  associate: (models) => {
    VerificationTokenModel.belongsTo(models.User.model);
  },
  get model() {
    return VerificationTokenModel;
  }
};
