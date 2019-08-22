const Sequelize = require('sequelize');
const {Model} = Sequelize;
const challengeConstants = require('../../constants/challenge');

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
   *      - depositOp
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
   *          depositOp:
   *              $ref: '#/definitions/TransactionObject'
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
   *  TransactionObject:
   *    type: object
   *    required:
   *      - ref_block_num
   *      - ref_block_prefix
   *      - expiration
   *      - operations
   *      - signatures
   *    properties:
   *      ref_block_num:
   *        type: integer
   *      ref_block_prefix:
   *        type: integer
   *      expiration:
   *        type: string
   *        format: date
   *      operations:
   *        type: array
   *        items:
   *          type: array
   *          items: {}
   *          example:
   *            - 0
   *            - {
   *              fee: {
   *                "amount": "2000000",
   *                "asset_id": "1.3.0"
   *              },
   *              "from": "1.2.67",
   *              "to": "1.2.57",
   *              "amount": {
   *                "amount": "100",
   *                "asset_id": "1.3.0"
   *              },
   *              "extensions": []
   *            }
   *      extensions:
   *        type: array
   *        items:
   *          type: string
   *      signatures:
   *        type: array
   *        items:
   *          type: string
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
const attributes = {
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
};

module.exports = {
  init: (sequelize) => {
    ChallengeModel.init(attributes, {
      sequelize,
      modelName: 'challenges'
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
