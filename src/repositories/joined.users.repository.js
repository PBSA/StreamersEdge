const {model} = require('../db/models/joined.users.model');
const {model: UserModel} = require('../db/models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const Sequelize = require('sequelize');

class JoinedUsersRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   * @param user
   * @param challengeId
   * @param ppyAmount
   * @param [options]
   * @returns {Promise<ChallengeModel>}
   */
  async joinToChallenge(userId, challengeId, ppyAmount, options) {
    return super.create({
      challengeId,
      userId,
      ppyAmount
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
      }],
      attributes: [[Sequelize.fn('sum', Sequelize.col('ppyAmount')), 'totalDonation']],
      group : ['user.id']
    }).map((joinedUser) => ({
      ...joinedUser.toJSON(),
      user: joinedUser.user ? joinedUser.user.getPublic() : null
    }));
  }

}

module.exports = JoinedUsersRepository;
