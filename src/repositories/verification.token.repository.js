const crypto = require('crypto-random-string');
const {model} = require('../models/verification.token.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class VerificationTokenRepository extends BasePostgresRepository {

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
      }
    });
  }

}

module.exports = VerificationTokenRepository;
