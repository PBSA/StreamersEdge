const Sequelize = require('sequelize');

const {model} = require('../db/models/report.model');
const {model: UserModel} = require('../db/models/user.model');
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

  async fetchAll(search, offset, limit) {
    const filter = search ? {
      [Sequelize.Op.or]: [{
        '$troublemaker.username$':{
          [Sequelize.Op.iLike]: `%${search}%`
        }
      },{
        '$reporter.username$':{
          [Sequelize.Op.iLike]: `%${search}%`
        }
      }, {
        description: {
          [Sequelize.Op.iLike]: `%${search}%`
        }
      }]
    } : null;

    return this.model.findAll({
      where: filter,
      include: [
        {
          model: UserModel,
          attributes: ['email', 'username', 'userType', 'avatar'],
          as: 'troublemaker'
        },
        {
          model: UserModel,
          attributes: ['username'],
          as: 'reporter'
        }
      ],
      attributes: {
        exclude: ['updatedAt']
      },
      offset,
      limit
    });
  }

  async fetchReportByUserId(userId) {
    return this.model.findOne({
      where:{
        reportedUserId: userId
      },
      include: [
        {
          model: UserModel,
          attributes: ['username','email'],
          as: 'reporter'
        }
      ],
      attributes: {
        include: ['id']
      }
    });
  }

}

module.exports = ReportRepository;
