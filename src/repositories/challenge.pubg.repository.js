const {model} = require('../models/challenge.pubg.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class ChallengePubgRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = ChallengePubgRepository;
