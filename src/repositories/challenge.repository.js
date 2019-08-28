const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const invitedUsersModel = require('../db/models/challenge.invited.users.model').model;
const challengeConditionModel = require('../db/models/challenge.condition.model').model;
const {model} = require('../db/models/challenge.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const consts = require('../constants/challenge');

class ChallengeRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   * @param pk
   * @param options
   * @returns {Promise<ChallengeModel>}
   */
  async findByPk(pk, options) {
    return super.findByPk(pk, options);
  }

  /**
   * @param id
   * @returns {Promise<ChallengeModel>}
   */
  async findAllChallenges(id) {
    return this.model.findAll({
      where: {
        [Op.or]: [{accessRule: 'anyone'}, {userId: id}, {['$challenge-invited-users.userId$']: id}]
      },
      include:[
        {
          model:invitedUsersModel, as:'challenge-invited-users',
          required:false
        }
      ],
      group: ['challenges.id','challenge-invited-users.id'],
      order: ['id']
    });
  }

  async findWaitToResolve() {
    return this.model.findAll({
      where: {
        status: consts.status.open,
        endDate: {
          [Op.lte]: new Date()
        }
      },
      include: [{
        model: invitedUsersModel,
        as: 'challenge-invited-users',
        required: false
      }, {
        model: challengeConditionModel,
        required: false
      }]
    });
  }

}

module.exports = ChallengeRepository;
