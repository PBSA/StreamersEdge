/* istanbul ignore file */
class BasePostgresRepository {

  /**
   * @param model
   */
  constructor(model = null) {
    this.model = model;
    this.model.sync();
  }

  async findByPk(pk) {
    return this.model.findByPk(pk);
  }

  async findOrCreate(options) {
    return this.model.findOrCreate(options);
  }

}

module.exports = BasePostgresRepository;
