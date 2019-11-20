const profileConstants = require('../constants/profile');
const Sequelize = require('sequelize');

class AdminService {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {BanHistoryRepository} opts.banHistoryRepository
   * @param {SessionsRepository} opts.sessionsRepository
   * @param {ReportRepository} opts.reportRepository
   * @param {DbConnection} opts.dbConnection
   */
  constructor(opts) {
    this.dbConnection = opts.dbConnection;
    this.userRepository = opts.userRepository;
    this.reportRepository = opts.reportRepository;
    this.banHistoryRepository = opts.banHistoryRepository;
    this.sessionsRepository = opts.sessionsRepository;
  }

  /**
   * Get a list of users corresponding to the specified flags
   *
   * @param fetchingParams
   * @returns {Promise<[UserModel]>}
   */
  async getUsers(fetchingParams) {
    const {flag, search, offset = 0, limit = 20} = fetchingParams;
    return await this.userRepository.getUsersWithBansHistory(flag, search, offset, limit);
  }

  /**
   *
   * @param {UserModel} blocker
   * @param {Number} userId
   * @return {Promise<void>}
   */
  async banUser(blocker, userId) {
    return this.dbConnection.getConnection().transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
    }, async (transaction) => {
      const {id: blockerId} = blocker;

      await this.userRepository.changeStatus(userId, profileConstants.status.banned, {transaction});
      await this.banHistoryRepository.createBanRecord(blockerId, userId, {transaction});
      await this.sessionsRepository.remove(userId, {transaction});

      return true;
    });
  }

  /**
   *
   * @param {UserModel} unblocker
   * @param {Number} userId
   * @return {Promise<void>}
   */
  async unbanUser(unblocker, userId) {
    return this.dbConnection.getConnection().transaction({
      isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED
    }, async (transaction) => {
      const {id: unblockerId} = unblocker;

      await this.userRepository.changeStatus(userId, profileConstants.status.active, {transaction});
      await this.banHistoryRepository.updateRecordToUnban(unblockerId, userId, {transaction});

      return true;
    });
  }

  async getUserInfo(userId) {
    return await this.userRepository.getUserInfo(userId);
  }

  async getReports(){
    return this.reportRepository.fetchAll();
  }


}

module.exports = AdminService;
