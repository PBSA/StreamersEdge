const Sequelize = require('sequelize');
const {Model} = Sequelize;

class LeagueOfLegendsMatchModel extends Model {
}

module.exports = {
  init: (sequelize) => {
    LeagueOfLegendsMatchModel.init({
      gameId: {
        type: Sequelize.STRING,
        unique: true
      },
      realm: {type: Sequelize.STRING},
      createdAt: {type: Sequelize.DATE},
      gameDuration: {type: Sequelize.INTEGER},
      gameMode: {type: Sequelize.STRING},
      gameType: {type: Sequelize.STRING},
      mapId: {type: Sequelize.INTEGER},
      seasonId: {type: Sequelize.INTEGER},
      queueId: {type: Sequelize.INTEGER},
      platformId: {type: Sequelize.STRING}
    }, {
      sequelize,
      modelName: 'leagueoflegends-matches'
    });
  },
  associate: (models) => {
    LeagueOfLegendsMatchModel.hasMany(models.LeagueOfLegendsParticipant.model);
  },
  get model() {
    return LeagueOfLegendsMatchModel;
  }
};
