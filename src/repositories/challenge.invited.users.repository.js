const {model} = require('../db/models/challenge.invited.users.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class ChallengeInvitedUsersRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }


  /**
   * @param challengeId
   * @param userId
   * @returns {Promise<Boolean>}
   */
  async isUserInvited(challengeId, userId) {
    return !!(await this.model.findOne({
      where: {
        challengeId: challengeId,
        userId: userId
      }
    }));
  }

  /**
   * @param challengeId
   * @param userId
   * @returns {Promise<Boolean>}
   */
  async isAllowFor(challengeId, userId) {
    return !!(await this.model.findOne({
      where: {
        challengeId: challengeId,
        userId: userId
      }
    }));
  }

}

module.exports = ChallengeInvitedUsersRepository;
