const Sequelize = require('sequelize');
const {Model} = Sequelize;

/**
 * @typedef {Class} BanHistoryModel
 * @property {Number} id
 * @property {Number} userId
 * @property {Number} bannedById
 * @property {Number} unbannedById
 * @property {Date} unbanDate
 */
class BanHistoryModel extends Model {

}
module.exports = {
  init: (sequelize) => {
    BanHistoryModel.init({
      userId: {
        type: Sequelize.INTEGER
      },
      bannedById: {
        type: Sequelize.INTEGER
      },
      unbannedById: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      unbanDate:{
        type: Sequelize.DATE,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'ban-histories'
    });
  },
  associate(models) {
    BanHistoryModel.belongsTo(models.User.model, {foreignKey : 'userId', targetKey: 'id'});
    BanHistoryModel.belongsTo(models.User.model, {foreignKey : 'bannedById', targetKey: 'id'});
    BanHistoryModel.belongsTo(models.User.model, {foreignKey : 'unbannedById', targetKey: 'id'});
  },
  get model() {
    return BanHistoryModel;
  }
};
