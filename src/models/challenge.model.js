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
   * @returns {ChallengePublicObject}
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
      conditionsText: this.conditionsText,
      userId: this.userId
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
      },
      status: {
        type: Sequelize.ENUM(Object.keys(challengeConstants.status).map((key) => challengeConstants.status[key])),
        defaultValue: challengeConstants.status.open
      }
    }, {
      sequelize,
      modelName: 'challenge'
    });
  },
  associate: (models) => {
    ChallengeModel.belongsTo(models.User.model);
    ChallengeModel.belongsTo(models.User.model, {
      foreignKey: 'winnerUserId'
    });
    ChallengeModel.hasMany(models.ChallengeCondition.model);
    ChallengeModel.hasMany(models.ChallengeInvitedUsers.model);
    ChallengeModel.hasMany(models.JoinedUsers.model);
  },
  get model() {
    return ChallengeModel;
  }
};

