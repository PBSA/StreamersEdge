const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const invitedUsersModel = require('../db/models/challenge.invited.users.model').model;
const joinedUsersModel = require('../db/models/joined.users.model').model;
const userModel = require('../db/models/user.model').model;
const challengeConditionModel = require('../db/models/challenge.condition.model').model;
const challengeWinnersModel = require('../db/models/challenge.winners.model').model;
const {model} = require('../db/models/challenge.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const consts = require('../constants/challenge');
const txConstants = require('../constants/transaction');
const moment = require('moment');

class ChallengeRepository extends BasePostgresRepository {

  /**
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {TransactionRepository} opts.transactionRepository
   */
  constructor(opts) {
    super(model);

    this.config = opts.config;
    this.peerplaysRepository = opts.peerplaysRepository;
    this.transactionRepository = opts.transactionRepository;
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
    const orderQuery = (order && order !== 'totalDonations') ? 
      order === 'createdAt' ? [order, 'DESC'] : 
        order === 'name' ? [Sequelize.fn('LOWER', Sequelize.col('name')), 'ASC'] : [order, 'ASC'] : null;
    const searchList = [];

    if (moment(searchText).isValid()) {
      searchList.push(
        {createdAt:
            {[Op.between]: [moment(searchText).format('YYYY-MM-DD'),moment(searchText).add(1, 'days').format('YYYY-MM-DD')]}
        });
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

  findAllChallengesForUser(userId) {
    return this.model.findAll({
      where: {userId}
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

  async refundChallengesCreatedByUser(user) {
    const challenges = await this.findAllChallengesForUser(user.id);

    for (const challenge of challenges) {
      if (challenge.status !== consts.status.open) {
        continue;
      }

      const joinedUsers = await joinedUsersModel.findAll({
        where: {challengeId: challenge.id},
        include: [{
          model: userModel
        }],
        attributes: [[Sequelize.fn('sum', Sequelize.col('ppyAmount')), 'totalDonation']],
        group: ['user.id']
      }, {raw: true});

      for (let joinedUser of joinedUsers) {
        joinedUser = joinedUser.toJSON();
        const tx = await this.peerplaysRepository.sendPPYFromReceiverAccount(joinedUser.user.peerplaysAccountId, joinedUser.totalDonation);

        await this.transactionRepository.create({
          txId: tx.id,
          blockNum: tx.block_num,
          trxNum: tx.trx_num,
          ppyAmountValue: joinedUser.totalDonation,
          type: txConstants.types.challengeRefund,
          userId: joinedUser.user.id,
          challengeId: challenge.id,
          peerplaysFromId: this.config.peerplays.paymentReceiver,
          peerplaysToId: joinedUser.user.peerplaysAccountId
        });
      }

      challenge.status = consts.status.paid;
      challenge.streamLink = null;
      await challenge.save();
    }
  }

}

module.exports = ChallengeRepository;
