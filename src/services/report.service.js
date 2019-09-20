class ReportService {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {BanHistoryRepository} opts.banHistoryRepository
   * @param {SessionsRepository} opts.sessionsRepository
   * @param {DbConnection} opts.dbConnection
   */
  constructor(opts) {
    this.dbConnection = opts.dbConnection;
    this.userRepository = opts.userRepository;
    this.banHistoryRepository = opts.banHistoryRepository;
    this.sessionsRepository = opts.sessionsRepository;
    this.reportRepository = opts.reportRepository;
  }

  async createReport(reportedUserId, reportedByUserId, type, description, videoUrl) {
    return await this.reportRepository.createReportForUserById(reportedUserId, reportedByUserId, type, description, videoUrl);
  }
 
}
 
module.exports = ReportService;