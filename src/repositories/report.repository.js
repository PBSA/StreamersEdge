const {model} = require('../models/report.model');
const {model: UserModel} = require('../models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class ReportRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  async createReportForUserById(reportedUserId, reportedByUserId, reason, description, videoUrl) {
    return this.model.create({
      reportedUserId,
      reportedByUserId,
      reason,
      description,
      videoUrl
    });
  }
  
  async fetchAll(){
    return this.model.findAll({
      include: [
        {
          model: UserModel,
          attributes: ['username'],
          as: 'reporter'
        },
        {
          model: UserModel,
          attributes: ['email', 'username', 'userType', 'avatar'],
          as: 'troublemaker'
        }
      ],
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });
  }

}
  
module.exports = ReportRepository;
  