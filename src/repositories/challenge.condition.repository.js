const {model} = require('../db/models/challenge.condition.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class ChallengeConditionRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = ChallengeConditionRepository;
