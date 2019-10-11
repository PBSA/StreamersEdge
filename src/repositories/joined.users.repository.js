const {model} = require('../db/models/joined.users.model');
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
  async joinToChallenge(userId, challengeId, options) {
    return super.create({
      challengeId,
      userId
    }, options);
  }

  async hasUserJoined(userId, challengeId) {
    return await this.model.count({
      where: {userId, challengeId}
    }) !== 0;
  }

}

module.exports = JoinedUsersRepository;
