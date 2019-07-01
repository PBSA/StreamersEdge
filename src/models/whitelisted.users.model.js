const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Object} WhitelistedUsers
 * @property {Number} id
 * @property {Number} fromUser
 * @property {Number} toUser
 */

/**
 * @typedef {Object} WhitelistedUsersPublicObject
 * @property {Number} id
 * @property {Number} fromUser
 * @property {Number} toUser
 * @property {Date} createdAt
 * @property {Date} updatedAt
 * @property {Date} endDate
 * @property {Number} userId
 */

class WhitelistedUsers extends Model {

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
    WhitelistedUsers.init({
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
      modelName: 'whitelisted-users'
    });
  },
  associate: (models) => {
    WhitelistedUsers.belongsTo(models.User.model);
  },
  get model() {
    return WhitelistedUsers;
  }
};
