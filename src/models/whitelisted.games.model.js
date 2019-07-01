const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} WhitelistedGames
 * @property {Number} id
 * @property {Number} fromUser
 * @property {Number} toUser
 */

/**
 * @typedef {Object} WhitelistedGamesPublicObject
 * @property {Number} id
 * @property {Number} fromUser
 * @property {Number} toUser
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} endDate
 * @property {Number} userId
 */

class WhitelistedGames extends Model {

  getPublic() {
    return {
      id: this.id,
      fromUser: this.fromUser,
      toUser: this.toUser
    };
  }

}

module.exports = {
  init: (sequelize) => {
    WhitelistedGames.init({
      fromUser: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      toUser: {
        type: Sequelize.INTEGER,
        allowNull: false
      }
    }, {
      sequelize,
      modelName: 'whitelisted-games'
    });
  },
  associate: (models) => {
    WhitelistedGames.belongsTo(models.User.model);
  },
  get model() {
    return WhitelistedGames;
  }
};
