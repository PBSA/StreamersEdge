const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} ChallengeWinnersObject
 * @property {Number} id
 * @property {Number} challengeId
 * @property {Number} userId
 */

class ChallengeWinners extends Model {}
module.exports = {
  init: (sequelize) => {
    ChallengeWinners.init({
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
    ChallengeWinners.belongsTo(models.Challenge.model);
    ChallengeWinners.belongsTo(models.User.model);
  },
  get model() {
    return ChallengeWinners;
  }
};
