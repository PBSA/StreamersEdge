const {model} = require('../db/models/whitelisted.games.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class WhitelistedGamesRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   * @param id
   * @param [tx]
   * @returns {Promise<Number>}
   */
  async destroyByToUserId(id, tx) {
    return this.model.destroy({where: {toUser: id}}, {transaction: tx});
  }

  /**
   * @param data
   * @param [tx]
   * @returns {Promise<Array>}
   */
  async bulkCreateFromGames(data, tx) {
    return this.model.bulkCreate(data, {validate: true}, {transaction: tx});
  }

  /**
   * @param toUserId
   * @param fromChallengeId
   * @returns {Promise<Boolean>}
   */
  async isWhitelistedFor(toUserId, fromGame) {
    return !!(await this.model.findOne({
      where: {
        toUser: toUserId,
        fromGame: fromGame
      }
    }));
  }

}

module.exports = WhitelistedGamesRepository;
