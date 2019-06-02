/* istanbul ignore file */
class BasePostgresRepository {

  /**
   * @param model
   */
  constructor(model = null) {
    this.model = model;
  }

  async findByPk(pk, options) {
    return this.model.findByPk(pk, options);
  }

  async findOrCreate(options) {
    return this.model.findOrCreate(options);
  }

  async create(data) {
    return this.model.create(data);
  }

}

module.exports = BasePostgresRepository;
