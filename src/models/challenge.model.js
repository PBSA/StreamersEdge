const Sequelize = require('sequelize');
const {Model} = Sequelize;
const challengeConstants = require('../constants/challenge');

/**
 * @typedef {Object} ChallengeModel
 * @property {Number} id
 * @property {String} name
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {String} game
 * @property {String} accessRule
 * @property {Number} ppyAmount
 * @property {String} conditionsText
 */

/**
 * @typedef {Object} ChallengePublicObject
 * @property {Number} id
 * @property {String} name
 * @property {Date} createdAt
 * @property {Date} startDate
 * @property {Date} endDate
 * @property {String} game
 * @property {String} accessRule
 * @property {Number} ppyAmount
 * @property {[Number]} invitedUsers
 * @property {String} conditionsText
 * @property {UserPublicObject} user
 * @property {[ChallengeConditionModel]} conditions
 */

class ChallengeModel extends Model {
  /**
   *
   * @swagger
   *
   * definitions:
   *  ChallengeConditionNew:
   *   type: object
   *   required:
   *    - param
   *    - operator
   *    - value
   *    - join
   *   properties:
   *    param:
   *      type: string
   *      enum:
   *        - result_place
   *        - win_time
   *        - frags
   *    operator:
   *      type: string
   *      enum:
   *        - ">"
   *        - "<"
   *        - "="
   *        - ">="
   *        - "<="
   *    value:
   *      type: integer
   *    join:
   *      type: string
   *      enum:
   *        - AND
   *        - OR
   *        - END
   *
   *  ChallengeNew:
   *    type: object
   *    required:
   *      - notifications
   *      - endDate
   *      - game
   *      - accessRule
   *      - ppyAmount
   *    properties:
   *      name:
   *        type: string
   *      startDate:
   *        type: string
   *        format: date
   *      endDate:
   *        type: string
   *        format: date
   *      accessRule:
   *        type: string
   *        enum:
   *          - invite
   *          - anyone
   *      ppyAmount:
   *        type: integer
   *      conditionsText:
   *        type: string
   *      game:
   *        type: string
   *        enum:
   *          - pubg
   *      invitedAccounts:
   *        type: array
   *        items:
   *          type: integer
   *
   *  ChallengeFullNew:
   *    allOf:
   *      - $ref: '#/definitions/ChallengeNew'
   *      - type: object
   *        properties:
   *          conditions:
   *            type: array
   *            items:
   *              $ref: '#/definitions/ChallengeConditionNew'
   *
   *  ChallengeCondition:
   *    allOf:
   *      - $ref: '#/definitions/ChallengeConditionNew'
   *      - type: object
   *        properties:
   *          id:
   *            type: integer
   *          createdAt:
   *            type: string
   *            format: date
   *          updatedAt:
   *            type: string
   *            format: date
   *          challengeId:
   *            type: integer
   *
   *  Challenge:
   *    allOf:
   *      - $ref: '#/definitions/ChallengeNew'
   *      - type: object
   *        properties:
   *          conditions:
   *            type: array
   *            items:
   *              $ref: '#/definitions/ChallengeCondition'
   *          id:
   *            type: integer
   *          createdAt:
   *            type: string
   *            format: date
   *          updatedAt:
   *            type: string
   *            format: date
   *          invitedUsers:
   *            type: array
   *            items:
   *               $ref: '#/definitions/User'
   *          user:
   *            $ref: '#/definitions/User'
   *
   */
  getPublic() {
    const result = {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      startDate: this.startDate,
      endDate: this.endDate,
      game: this.game,
      accessRule: this.accessRule,
      ppyAmount: this.ppyAmount,
      conditionsText: this.conditionsText
    };

    if (this.user) {
      result.user = this.user.getPublic();
    }

    if (this['challenge-conditions']) {
      result.conditions = this['challenge-conditions'];
    }

    if (this['challenge-invited-users']) {
      result.invitedUsers = this['challenge-invited-users'];
    }

    return result;
  }
}

module.exports = {
  init: (sequelize) => {
    ChallengeModel.init({
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      game: {
        type: Sequelize.STRING,
        allowNull: false
      },
      accessRule: {
        type: Sequelize.ENUM(...Object.keys(challengeConstants.accessRules)),
        allowNull: false
      },
      ppyAmount: {
        type: Sequelize.BIGINT,
        allowNull: false
      },
      conditionsText: {
        type: Sequelize.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'challenge'
    });
  },
  associate: (models) => {
    ChallengeModel.belongsTo(models.User.model);
    ChallengeModel.hasMany(models.ChallengeCondition.model);
    ChallengeModel.hasMany(models.ChallengeInvitedUsers.model);
  },
  get model() {
    return ChallengeModel;
  }
};
