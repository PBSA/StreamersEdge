const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} VerificationTokenModel
 * @property {Number} id
 * @property {String} userId
 * @property {String} token
 * @property {Boolean} isActive
 */
class EmailVerificationTokenModel extends Model {}

module.exports = {
  init: (sequelize) => {
    EmailVerificationTokenModel.init({
      token: {
        type: Sequelize.STRING,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      }
    }, {
      sequelize,
      modelName: 'email-verification-tokens'
    });
  },
  associate: (models) => {
    EmailVerificationTokenModel.belongsTo(models.User.model);
  },
  get model() {
    return EmailVerificationTokenModel;
  }
};
