const {model} = require('../db/models/challenge.winners.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class ChallengeWinnersRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  addWinner(userId, challengeId, options) {
    return super.create({
      challengeId,
      userId
    }, options);
  }
  
  getForChallenge(challengeId) {
    return this.model.findAll({
      where: {challengeId}
    });
  }

}

module.exports = ChallengeWinnersRepository;
