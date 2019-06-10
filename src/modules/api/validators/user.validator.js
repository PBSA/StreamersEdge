const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');

class UserValidator extends BaseValidator {

  constructor(opts) {
    super();

    this.config = opts.config;
    this.getUser = this.getUser.bind(this);
  }

  getUser() {
    const querySchema = {
      id: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, (req, query) => query.id);
  }

}

module.exports = UserValidator;
