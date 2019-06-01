const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');

class UserValidator extends BaseValidator {

  constructor(opts) {
    super();

    this.config = opts.config;
    this.getUser = this.getUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  getUser() {
    const querySchema = {
      id: Joi.string().objectId().required()
    };

    return this.validate(querySchema, null, (req, query) => query.id);
  }

  getUsers() {
    const querySchema = {
      search: Joi.string().regex(/^[a-zA-Z0-9.-]+$/).allow('').max(254),
      limit: Joi.number().required().max(100),
      skip: Joi.number()
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

}

module.exports = UserValidator;
