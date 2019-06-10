const {model} = require('../models/user.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class UserRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = UserRepository;
