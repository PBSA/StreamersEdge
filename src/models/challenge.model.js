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
 * @property {UserPublicObject} user
 * @property {ChallengePubgPublicObject} criteria
 */

class ChallengeModel extends Model {
  getPublic() {
    const result = {
      id: this.id,
      name: this.name,
      createdAt: this.createdAt,
      startDate: this.startDate,
      endDate: this.endDate,
      game: this.game,
      accessRule: this.accessRule,
      ppyAmount: this.ppyAmount
    };

    if (this.user) {
      result.user = this.user.getPublic();
    }

    if (this[`challenge-${this.game}`]) {
      result.criteria = this[`challenge-${this.game}`].getPublic();
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
      }
    }, {
      sequelize,
      modelName: 'challenge'
    });
  },
  associate: (models) => {
    ChallengeModel.belongsTo(models.User.model);
    ChallengeModel.hasOne(models.ChallengePubg.model);
    ChallengeModel.hasMany(models.ChallengeInvitedUsers.model);
  },
  get model() {
    return ChallengeModel;
  }
};
