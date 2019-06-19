const Sequelize = require('sequelize');
const {model} = require('../models/stream.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class StreamRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
  * @param pk
  * @param options
  * @returns {Promise<StreamModel>}
  */
  async findByPk(pk, options) {
    return super.findByPk(pk, options);
  }

  async searchStreams(search, limit, offset, sortBy, isAscending, searchActiveStreams, options) {
    const filter = search ? {
      [Sequelize.Op.and]:[
        {[Sequelize.Op.or]: [
          {name: {[Sequelize.Op.like]: `%${search}%`}},
          {game: {[Sequelize.Op.like]: `%${search}%`}},
          {'$users.id$': {[Sequelize.Op.like]: `%${search}%`}},
          {'$users.username$': {[Sequelize.Op.like]: `%${search}%`}},
          {sourceName: {[Sequelize.Op.like]: `%${search}%`}}
        ]},
        {isActive: {searchActiveStreams}}
      ]
    } : null;

    const sortOrder = isAscending?'ASC':'DESC';
    return this.model.findAll({
      where: filter,
      options,
      order: [
        [`${sortBy}`,`${sortOrder}`]
      ],
      offset,
      limit
    });
  }

  async getUserStream(user, limit, offset, options) {
    return this.model.findAll({
      where: {userId: `%${user}%`},
      options,
      offset,
      limit
    });
  }

}

module.exports = StreamRepository;
