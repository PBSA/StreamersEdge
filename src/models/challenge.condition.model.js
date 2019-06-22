const Sequelize = require('sequelize');
const {Model} = Sequelize;
const {operators, joinTypes} = require('../constants/challenge');

/**
 * @typedef {Object} ChallengeConditionModel
 * @property {Number} id
 * @property {String} param
 * @property {String} operator
 * @property {String} value
 * @property {String} join
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {ChallengeConditionModel} ChallengeConditionModelObject
 */

class ChallengeConditionModel extends Model {
  getPublic() {
    return this.toJSON();
  }
}

module.exports = {
  init: (sequelize) => {
    ChallengeConditionModel.init({
      param: {
        type: Sequelize.STRING,
        allowNull: false
      },
      operator: {
        type: Sequelize.ENUM(operators),
        allowNull: false
      },
      value: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      join: {
        type: Sequelize.ENUM(joinTypes),
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'challenge-condition'
    });
  },
  associate: (models) => {
    ChallengeConditionModel.belongsTo(models.Challenge.model);
  },
  get model() {
    return ChallengeConditionModel;
  }
};
