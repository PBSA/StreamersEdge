const Sequelize = require('sequelize');

const {model} = require('../models/session.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class SessionsRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   *
   * @param userId
   * @param transaction
   * @return {Promise<SessionModel>}
   */
  async remove(userId, {transaction} = {transaction: undefined}) {
    const likeString = `%"passport":{"user":${userId}}%`;

    return this.model.destroy({
      where: {data: {[Sequelize.Op.like]: likeString}}
    },
    {
      transaction
    });
  }

}

module.exports = SessionsRepository;
