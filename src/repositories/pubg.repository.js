const {model} = require('../db/models/pubg.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class PubgRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = PubgRepository;
