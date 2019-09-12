const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} VerificationTokenModel
 * @property {Number} id
 * @property {String} userId
 * @property {String} token
 * @property {Boolean} isActive
 * @property {Boolean} email
 */
class VerificationTokenModel extends Model { }

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
      },
      email: {
        type: Sequelize.STRING,
        defaultValue: ''
      }
    }, {
      sequelize,
      modelName: 'verification-tokens'
    });
  },
  associate: (models) => {
    VerificationTokenModel.belongsTo(models.User.model);
  },
  get model() {
    return VerificationTokenModel;
  }
};
