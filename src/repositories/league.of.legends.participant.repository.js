const {model} = require('../db/models/league.of.legends.participant.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class LeagueOfLegendsParticipantRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = LeagueOfLegendsParticipantRepository;
