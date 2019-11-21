const Sequelize = require('sequelize');
const {Model} = Sequelize;
const challengeConstants = require('../../constants/challenge');

/**
 * @typedef {Object} ChallengeModel
 * @property {Number} id
 * @property {String} name
 * @property {Date} timeToStart
 * @property {String} game
 * @property {String} conditionsText
 * @property {String} streamLink
 */

/**
 * @typedef {Object} ChallengePublicObject
 * @property {Number} id
 * @property {String} name
 * @property {Date} createdAt
 * @property {Date} timeToStart
 * @property {String} game
 * @property {[Number]} invitedUsers
 * @property {String} conditionsText
 * @property {String} streamLink
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
   *      - name
   *      - timeToStart
   *      - game
   *    properties:
   *      name:
   *        type: string
   *      timeToStart:
   *        type: string
   *        format: date
   *      conditionsText:
   *        type: string
   *      streamLink:
   *        type: string
   *      game:
   *        type: string
   *        enum:
   *          - pubg
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
   *            type: number
   *          createdAt:
   *            type: string
   *            format: date
   *          updatedAt:
   *            type: string
   *            format: date
   *          status:
   *            type: string
   *          userId:
   *            type: string
   *          user:
   *            type: object
   *            properties:
   *              username:
   *                type: string
   *              avatar:
   *                type: string
   *          joined:
   *            type: boolean
   *          joinedUsers:
   *            type: array
   *            items:
   *              $ref: '#/definitions/User'
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
      timeToStart: this.timeToStart,
      game: this.game,
      conditionsText: this.conditionsText,
      streamLink: this.streamLink,
      userId: this.userId
    };

    if (this.user) {
      result.user = this.user.getPublic();
    }

    if (this['challenge-conditions']) {
      result.conditions = this['challenge-conditions'];
    }

    return result;
  }
}
const attributes = {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  timeToStart: {
    type: Sequelize.DATE,
    allowNull: true
  },
  game: {
    type: Sequelize.STRING,
    allowNull: false
  },
  conditionsText: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  streamLink: {
    type: Sequelize.STRING,
    allowNull: true
  },
  status: {
    type: Sequelize.ENUM(Object.keys(challengeConstants.status).map((key) => challengeConstants.status[key])),
    defaultValue: challengeConstants.status.open
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
    ChallengeModel.hasMany(models.JoinedUsers.model);
  },
  get model() {
    return ChallengeModel;
  }
};
