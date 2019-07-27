const Sequelize = require('sequelize');

const {model} = require('../models/user.model');
const {model: banHistoryModel} = require('../models/ban.history.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const {status} = require('../constants/profile');

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

  /**
   * @param flag
   * @param search
   * @param offset
   * @param limit
   * @returns {Promise<UserModel[]>}
   */
  async getUsersWithBansHistory(flag, search, offset, limit) {
    const filter = search ? {
      [Sequelize.Op.or]: [{
        username: {
          [Sequelize.Op.like]: `%${search}%`
        }
      }, {
        email: {
          [Sequelize.Op.like]: `%${search}%`
        }
      }]
    } : {};

    switch (flag) {
      case status.banned: {
        filter.status = status.banned;
        break;
      }

      case status.active: {
        filter.status = status.active;
        break;
      }

      default: {
        break;
      }
    }

    return this.model.findAll({
      where: filter,
      include: [
        {
          model: banHistoryModel,
          where: {
            unbannedById: null
          },
          attributes: ['bannedById', ['createdAt', 'bannedAt']],
          required: false
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt', 'applicationType', 'pushNotificationId', 'password']
      },
      raw: true,
      order: [[ 'id', 'ASC' ]],
      offset,
      limit
    });
  }

  async getUserInfo(userId) {
    const userInfo = await this.model.findOne({
      where: {
        id: userId
      },
      attributes: ['username', 'email', 'peerplaysAccountName', 'facebook', 'youtube', 'twitchId']
    });

    userInfo.addTwitchLink();

    return userInfo;
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

  async setAccountId(userId, accountId) {
    return this.model.update(
      {peerplaysAccountId: accountId},
      {where: {id: userId}}
    );
  }

  /**
   *
   * @param {Number} userId
   * @param {String} status
   * @param {Object} transaction
   * @return {Promise<*>}
   */
  async changeStatus(userId, status, {transaction} = {transaction: undefined}) {
    return this.model.update(
      {
        status
      },
      {
        where: {
          id: userId
        },
        returning: true,
        transaction
      }
    );
  }

  async findWithGames() {
    return this.model.findAll({
      where: {
        pubgUsername: {
          [Sequelize.Op.ne]: null
        }
      }
    });
  }

}

module.exports = UserRepository;
