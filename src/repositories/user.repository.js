const Sequelize = require('sequelize');
const {model} = require('../models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class UserRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   * @param ids
   * @returns {Promise<UserModel[]>}
   */
  async findByPkList(ids) {
    return this.model.findAll({
      where: {
        id: {[Sequelize.Op.in]: ids}
      }
    });
  }

  async searchUsers(search, limit, offset) {
    const filter = search ? {
      peerplaysAccountName: {
        [Sequelize.Op.like]: `%${search}%`
      }
    } : null;
    return this.model.findAll({
      where: filter,
      offset,
      limit
    });
  }

}

module.exports = UserRepository;
