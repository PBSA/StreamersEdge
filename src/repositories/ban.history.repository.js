const {model} = require('../db/models/ban.history.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class BanHistoryRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   *
   * @param {Number} bannedById the id of admin who has banned the user with <userId> id
   * @param {Number} userId
   * @return {Promise<BanHistoryModel>}
   */
  async createBanRecord(bannedById, userId, {transaction} = {transaction: undefined}) {
    return this.model.create({
      userId,
      bannedById
    },
    {
      transaction
    });
  }

  /**
   *
   * @param userId
   * @return {Promise<BanHistoryModel[]>}
   */
  async findLastEntryByUserId(userId){
    return this.model.findAll({
      limit: 1,
      where: {
        userId: userId
      },
      order: [ [ 'id', 'DESC' ]]
    });
  }

}

module.exports = BanHistoryRepository;
