const Sequelize = require('sequelize');
const {Model} = Sequelize;

class PubgParticipantModel extends Model {
}

module.exports = {
  init: (sequelize) => {
    PubgParticipantModel.init({
      accountId: {type: Sequelize.STRING},
      name: {type: Sequelize.STRING},
      rank: {type: Sequelize.INTEGER},
      kill: {type: Sequelize.INTEGER},
      health: {type: Sequelize.DOUBLE},
      teamId: {type: Sequelize.INTEGER},
      isWin: {type: Sequelize.BOOLEAN}
    }, {
      sequelize,
      modelName: 'pubg-participant'
    });
  },
  associate: (models) => {
    PubgParticipantModel.belongsTo(models.Pubg.model);
  },
  get model() {
    return PubgParticipantModel;
  }
};
