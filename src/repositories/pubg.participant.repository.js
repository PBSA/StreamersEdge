const {model} = require('../db/models/pubg.participant.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class PubgParticipantRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = PubgParticipantRepository;
