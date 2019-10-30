const Sequelize = require('sequelize');
const {Model} = Sequelize;

class LeagueOfLegendsParticipantModel extends Model {
}

module.exports = {
  init: (sequelize) => {
    LeagueOfLegendsParticipantModel.init({
      leagueOfLegendsMatchId: {type: Sequelize.INTEGER},
      accountId: {type: Sequelize.STRING},
      summonerName: {type: Sequelize.STRING},
      summonerId: {type: Sequelize.STRING},
      kills: {type: Sequelize.INTEGER},
      isWin: {type: Sequelize.BOOLEAN}
    }, {
      sequelize,
      modelName: 'leagueoflegends-participants'
    });
  },
  associate: (models) => {
    LeagueOfLegendsParticipantModel.belongsTo(models.LeagueOfLegendsMatch.model);
  },
  get model() {
    return LeagueOfLegendsParticipantModel;
  }
};
