const {model} = require('../db/models/whitelisted.users.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class WhitelistedUsersRepository extends BasePostgresRepository {

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
  async bulkCreateFromUsers(data, tx) {
    return this.model.bulkCreate(data, {validate: true}, {transaction: tx});
  }

  /**
   * @param toUserId
   * @param fromUserId
   * @returns {Promise<Boolean>}
   */
  async isWhitelistedFor(toUserId, fromUserId) {
    return !!(await this.model.findOne({
      where: {
        toUser: toUserId,
        fromUser: fromUserId
      }
    }));
  }

}

module.exports = WhitelistedUsersRepository;
