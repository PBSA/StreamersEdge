const Sequelize = require('sequelize');

const {model} = require('../db/models/user.model');
const {model: banHistoryModel} = require('../db/models/ban.history.model');
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
          email: login.toLowerCase()
        }, {
          username: login
        }]
      }
    });
  }

  async searchUsers(search, limit, offset) {
    const filter = search ? {
      username: {
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
    const searchList = [];
    const searchFilter = {
      [Sequelize.Op.or]: [{
        username: {
          [Sequelize.Op.like]: `%${search}%`
        }
      }, {
        email: {
          [Sequelize.Op.like]: `%${search}%`
        }
      }]
    };

    if(search) {
      searchList.push(searchFilter);
    }

    switch (flag) {
      case status.banned: {
        searchList.push({
          status: status.banned
        });
        break;
      }

      case status.active: {
        searchList.push({
          status: status.active
        });
        break;
      }

      default: {
        break;
      }
    }

    return this.model.findAll({
      where: {
        [Sequelize.Op.and]: searchList
      },
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

  async findWithChallengeSubscribed() {
    return this.model.findAll({
      where: {
        challengeSubscribeData: {
          [Sequelize.Op.ne]: null
        },
        notifications: true
      }
    });
  }


  async setPeerplaysAccountId(userId, accountId) {
    return await this.model.update(
      {peerplaysAccountId: accountId},
      {where: {id: userId}}
    );
  }

  async setPaypalDetails(userId, {paypalEmail, paypalAccountId}) {
    return await this.model.update(
      {paypalEmail, paypalAccountId},
      {where: {id: userId}}
    );
  }

  async getByPeerplaysAccountName(accountName) {
    return this.model.findOne({
      where: {
        peerplaysAccountName: accountName
      }
    });
  }

}

module.exports = UserRepository;
