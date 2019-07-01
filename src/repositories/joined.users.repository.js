const {model} = require('../models/joined.users.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class JoinedUsersRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   * @param user
   * @param challengeId
   * @param [options]
   * @returns {Promise<ChallengeModel>}
   */
  async joinToChallenge(user, challengeId, options) {
    return super.create({
      challengeId: challengeId,
      userId: user
    }, options);
  }

}

module.exports = JoinedUsersRepository;
