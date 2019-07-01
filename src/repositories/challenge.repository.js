const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const {model} = require('../models/challenge.model');
const invitedUsersModel = require('../models/challenge.invited.users.model').model;
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

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
      group: ['challenge.id','challenge-invited-users.id'],
      order: ['id']
    });
  }

}

module.exports = ChallengeRepository;
