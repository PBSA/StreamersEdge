const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} ChallengeWinnerObject
 * @property {Number} id
 * @property {Number} challengeId
 * @property {Number} userId
 */

class ChallengeWinnerModel extends Model {}
module.exports = {
  init: (sequelize) => {
    ChallengeWinnerModel.init({
      challengeId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'challenge-winners'
    });
  },
  associate: (models) => {
    ChallengeWinnerModel.belongsTo(models.Challenge.model);
    ChallengeWinnerModel.belongsTo(models.User.model);
  },
  get model() {
    return ChallengeWinnerModel;
  }
};
