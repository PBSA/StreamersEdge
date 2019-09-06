const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} SessionModel
 * @property {String} sid
 * @property {Date} expires
 * @property {String} data
 */
class SessionModel extends Model {}

module.exports = {
  init: (sequelize) => {
    SessionModel.init({
      sid: {
        type: Sequelize.STRING(36),
        unique: true,
        defaultValue: true
      },
      expires: {
        type: Sequelize.DATE
      },
      data: {
        type: Sequelize.TEXT
      }
    }, {
      sequelize,
      modelName: 'Sessions'
    });
  },
  associate: (models) => {
    SessionModel.belongsTo(models.User.model);
  },
  get model() {
    return SessionModel;
  }
};
