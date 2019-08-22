const Sequelize = require('sequelize');
const {Model} = Sequelize;

class PubgModel extends Model {
}

module.exports = {
  init: (sequelize) => {
    PubgModel.init({
      pubgId: {
        type: Sequelize.STRING,
        unique: true
      },
      createdAt: {type: Sequelize.DATE},
      duration: {type: Sequelize.INTEGER},
      gameMode: {type: Sequelize.STRING},
      mapName: {type: Sequelize.STRING},
      isCustomMatch: {type: Sequelize.BOOLEAN},
      shardId: {type: Sequelize.STRING},
      titleId: {type: Sequelize.STRING}
    }, {
      sequelize,
      modelName: 'pubgs'
    });
  },
  associate: (models) => {
    PubgModel.hasMany(models.PubgParticipant.model);
  },
  get model() {
    return PubgModel;
  }
};
