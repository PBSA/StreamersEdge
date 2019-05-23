const model = require('../models/user.model');
const BaseMongoRepository = require('./abstracts/base-mongo.repository');

class UserRepository extends BaseMongoRepository {

  /**
   * @param {RavenHelper} opts.ravenHelper
   */
  constructor(opts) {
    super(opts.ravenHelper, model);
  }

  /**
   * @param {Object} [conditions]
   * @param {Object} [projection] optional fields to return (http://bit.ly/1HotzBo)
   * @param {Object} [options] optional
   * @return {Promise.<UserDocument>}
   */
  async findOne(conditions, projection, options) {
    return super.findOne(conditions, projection, options);
  }

  /**
   * @param {Object|[Object]} doc document to create (or several docs as array)
   * @return {Promise.<UserDocument|[UserDocument]>}
   */
  async create(doc) {
    return super.create(doc);
  }

}

module.exports = UserRepository;
