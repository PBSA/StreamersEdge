const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} JoinedUsers
 * @property {Number} id
 * @property {Number} challengeId
 * @property {Number} userId
 * @property {Number} ppyAmount
 * @property {String} createdAt
 */

class JoinedUsers extends Model {

  /**
   *
   * @swagger
   *
   * definitions:
   *  JoinedUserMinimum:
   *   type: object
   *   properties:
   *    ppyAmount:
   *      type: number
   *    createdAt:
   *      type: string
   *      format: date-time
   *    user:
   *      type: object
   *      properties:
   *        username:
   *          type: string
   *        avatar:
   *          type: string
   *
   */

  getPublic() {
    return {
      id: this.id,
      challengeId: this.challengeId,
      userId: this.userId,
      ppyAmount: this.ppyAmount,
      createdAt: this.createdAt
    };
  }

}

module.exports = {
  init: (sequelize) => {
    JoinedUsers.init({
      challengeId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      ppyAmount: {
        type: Sequelize.DOUBLE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'joined-users'
    });
  },
  associate: (models) => {
    JoinedUsers.belongsTo(models.Challenge.model);
    JoinedUsers.belongsTo(models.User.model);
  },
  get model() {
    return JoinedUsers;
  }
};
