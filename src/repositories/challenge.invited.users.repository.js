const {model} = require('../models/challenge.invited.users.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class ChallengeInvitedUsersRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

}

module.exports = ChallengeInvitedUsersRepository;
