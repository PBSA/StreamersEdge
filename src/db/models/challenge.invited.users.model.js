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
    ChallengeInvitedUsersModel.init({}, {
      sequelize,
      modelName: 'challenge-invited-users'
    });
  },
  associate: (models) => {
    ChallengeInvitedUsersModel.belongsTo(models.Challenge.model);
    ChallengeInvitedUsersModel.belongsTo(models.User.model);
  },
  get model() {
    return ChallengeInvitedUsersModel;
  }
};
