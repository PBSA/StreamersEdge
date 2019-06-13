const crypto = require('crypto-random-string');
const {model} = require('../models/reset.token.model');
const {model: UserModel} = require('../models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

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
        token
      },
      include: {model: UserModel, required: true}
    });
  }

}

module.exports = ResetTokenRepository;
