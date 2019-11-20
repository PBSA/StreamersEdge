const {model} = require('../db/models/league.of.legends.match.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class LeagueOfLegendsMatchRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = LeagueOfLegendsMatchRepository;
