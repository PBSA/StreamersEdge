const crypto = require('crypto-random-string');
const {model} = require('../db/models/verification.token.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const {Op} = require('sequelize');
const moment = require('moment');

class VerificationTokenRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  async createToken(userId, email) {
    return this.model.create({
      userId,
      token: crypto({length: 26}),
      email: email
    });
  }

  async findActive(token) {
    return this.model.findOne({
      where: {
        isActive: true,
        token,
        createdAt: {
          [Op.gte]: moment(new Date()).subtract(10, 'minutes')
        }
      }
    });
  }

  async makeDeactive(userId) {
    return this.model.update(
      {isActive: false},
      {where: {userId: userId}}
    );
  }

}

module.exports = VerificationTokenRepository;
