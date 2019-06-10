const Sequelize = require('sequelize');
const {model} = require('../models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class UserRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  async getByLogin(login) {
    return this.model.findOne({
      where: {
        [Sequelize.Op.or]: [{
          email: login
        }, {
          username: login
        }],
        isEmailVerified: true
      }
    });
  }

  async getByEmailOrUsername(email, username) {
    return this.model.findOne({
      where: {[Sequelize.Op.or]: [{email}, {username}]}
    });
  }

}

module.exports = UserRepository;
