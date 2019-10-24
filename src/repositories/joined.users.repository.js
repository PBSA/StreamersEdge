const {model} = require('../db/models/joined.users.model');
const {model: UserModel} = require('../db/models/user.model');
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

  async getForChallenge(challengeId) {
    return await this.model.findAll({
      where: {
        challengeId
      },
      include: [{
        model: UserModel
      }]
    }).map((joinedUser) => ({
      ...joinedUser.toJSON(),
      user: joinedUser.user.getPublic()
    }));
  }

}

module.exports = JoinedUsersRepository;
