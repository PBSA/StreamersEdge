const crypto = require('crypto-random-string');
const {model} = require('../db/models/reset.token.model');
const {model: UserModel} = require('../db/models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const Sequelize = require('sequelize');

class ResetTokenRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  async createToken(userId) {
    return this.model.create({
      userId,
      token: crypto({length: 26})
    });
  }

  async findActive(token) {
    return this.model.findOne({
      where: {
        isActive: true,
        token,
        createdAt:{
          $lte: Sequelize.literal('NOW() - INTERVAL "10 minute"')
        }
      },
      include: {model: UserModel, required: true}
    });
  }

}

module.exports = ResetTokenRepository;
