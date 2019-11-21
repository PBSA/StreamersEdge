const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const invitedUsersModel = require('../db/models/challenge.invited.users.model').model;
const userModel = require('../db/models/user.model').model;
const challengeConditionModel = require('../db/models/challenge.condition.model').model;
const challengeWinnersModel = require('../db/models/challenge.winners.model').model;
const {model} = require('../db/models/challenge.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const consts = require('../constants/challenge');
const moment = require('moment');

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

  getFindParams(orderQuery) {
    return {
      include:[
        {
          model:userModel,
          attributes: ['username','avatar']
        },
        {
          model: challengeConditionModel,
          required: false
        }
      ],
      group: ['challenges.id','challenge-conditions.id','user.id'],
      order: [ orderQuery || 'id']
    };
  }

  /**
   * @param id
   * @param order
   * @param searchText
   * @returns {Promise<ChallengeModel>}
   */
  async findAllChallenges(id, {order='', searchText=''}) {
    const orderQuery = order ? order !== 'ppyAmount' ? [order, 'ASC'] : [order, 'DESC'] : null;
    const searchList = [];

    if (Number(searchText)) {
      searchList.push({ppyAmount: {[Op.eq] : parseInt(searchText)}});
    } else if (moment(searchText).isValid()) {
      searchList.push({[Op.and]: {
        startDate: {[Op.lte]: searchText},
        endDate: {[Op.gte]: searchText}
      }});
    } else {
      searchList.push({name: {[Op.iLike]: `%${searchText}%`}});
      searchList.push({game: {[Op.iLike]: `%${searchText}%`}});
      searchList.push({'$user.username$': {[Op.iLike]: `%${searchText}%`}});
    }

    return this.model.findAll({
      where: {
        [Op.or]: searchList
      },
      ...this.getFindParams(orderQuery)
    });
  }

  async findWonChallenges(userId) {
    const challengeIds = await challengeWinnersModel.findAll({
      where: {userId},
      attributes: ['challengeId']
    }, {raw: true}).map((w) => w.challengeId);

    return await Promise.all(challengeIds.map((id) => this.model.findOne({where: {id}, ...this.getFindParams()})));
  }

  async findWaitToResolve() {
    return this.model.findAll({
      where: {
        status: consts.status.open
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
