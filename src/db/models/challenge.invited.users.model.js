const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} ChallengeInvitedUsersObject
 * @property {Number} id
 * @property {Number} challengeId
 * @property {Number} userId
 */

class ChallengeInvitedUsersModel extends Model {}
module.exports = {
  init: (sequelize) => {
    ChallengeInvitedUsersModel.init({
      challengeId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      joinedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    }, {
      sequelize,
      modelName: 'challenge-invited-users'
    });
  },
  associate() {},
  get model() {
    return ChallengeInvitedUsersModel;
  }
};
