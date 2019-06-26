const Sequelize = require('sequelize');
const {model} = require('../models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class UserRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  async findAll() {
    return this.model.findAll();
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

  async getByLogin(login) {
    return this.model.findOne({
      where: {
        [Sequelize.Op.or]: [{
          email: login
        }, {
          username: login
        }],
        isEmailVerified: true
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

  async getByEmailOrUsername(email, username) {
    return this.model.findOne({
      where: {[Sequelize.Op.or]: [{email}, {username}]}
    });
  }

  /**
   * @param values
   * @param options
   * @returns {Promise<Array>}
   */
  async updateNotification(values, options) {
    return this.model.update(
      {notifications: options},
      {where: {id: values}}
    );
  }

  /**
   * @param values
   * @param options
   * @returns {Promise<Array>}
   */
  async updateInvitation(values, options) {
    return this.model.update(
      {invitations: options},
      {where: {id: values}}
    );
  }

  async getByTwitchId(searchtwitchId) {
    return this.model.findOne({
      where: {twitchId:searchtwitchId}
    });
  }

}

module.exports = UserRepository;
