const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} ChallengePubgModel
 * @property {Number} id
 * @property {Number} challengeId
 * @property {Boolean} shouldLead
 * @property {Number} shouldKill
 * @property {Number} shouldWinPerTime
 * @property {Number} minPlace
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */

/**
 * @typedef {ChallengePubgModel} ChallengePubgPublicObject
 */

class ChallengePubgModel extends Model {
  getPublic() {
    return this.toJSON();
  }
}

module.exports = {
  init: (sequelize) => {
    ChallengePubgModel.init({
      shouldLead: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      },
      shouldKill: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      shouldWinPerTime: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      minPlace: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'challenge-pubg'
    });
  },
  associate: (models) => {
    ChallengePubgModel.belongsTo(models.Challenge.model);
  },
  get model() {
    return ChallengePubgModel;
  }
};
