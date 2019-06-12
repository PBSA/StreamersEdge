const {model} = require('../models/challenge.model');
const BasePostgresRepository = require('./abstracts/base-postgres.repository');

class ChallengeRepository extends BasePostgresRepository {

  constructor() {
    super(model);
  }

  /**
   * @param pk
   * @param options
   * @returns {Promise<ChallengeModel>}
   */
  async findByPk(pk, options) {
    return super.findByPk(pk, options);
  }

}

module.exports = ChallengeRepository;
