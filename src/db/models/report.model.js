const Sequelize = require('sequelize');
const {Model} = Sequelize;
const profileConstants = require('../../constants/profile');

/**
 * @typedef {Class} BanHistoryModel
 * @property {Number} id
 * @property {Number} reportedUserId
 * @property {Number} reportedByUserId
 * @property {Number} bannedById
 * @property {Number} unbannedById
 * @property {Date} unbanDate
 */
class ReportModel extends Model {

}

module.exports = {
  init: (sequelize) => {
    ReportModel.init({
      reportedUserId: {
        type: Sequelize.INTEGER
      },
      reportedByUserId: {
        type:  Sequelize.INTEGER
      },
      reason: {
        type: Sequelize.ENUM(Object.keys(profileConstants.reportType).map((key) => profileConstants.reportType[key]))
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      videoUrl:{
        type: Sequelize.STRING,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: 'reports'
    });
  },
  associate(models) {
    ReportModel.belongsTo(models.User.model, {foreignKey : 'reportedUserId', targetKey: 'id', as: 'reporter'});
    ReportModel.belongsTo(models.User.model, {foreignKey : 'reportedByUserId', targetKey: 'id', as: 'troublemaker'});
  },
  get model() {
    return ReportModel;
  }
};
