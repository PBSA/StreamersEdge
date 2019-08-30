const crypto = require('crypto-random-string');
const {model} = require('../db/models/email.verification.token.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');
const {Op} = require('sequelize');
const moment = require('moment');

class EmailVerificationTokenRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  async createToken(userId,email) {
    return this.model.create({
      userId,
      email: email,
      token: crypto({length: 26})
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

}

module.exports = EmailVerificationTokenRepository;
