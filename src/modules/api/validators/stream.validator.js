const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');

class StreamValidator extends BaseValidator {

  constructor(opts) {
    super();

    this.config = opts.config;
    this.validateGetStream = this.validateGetStream.bind(this);
    this.validateGetStreams = this.validateGetStreams.bind(this);
  }

  validateGetStream() {
    const querySchema = {
      streamId: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, (req, query) => query.id);
  }

  validateGetStreams() {
    const querySchema = {
      search: Joi.string().regex(/^[a-zA-Z0-9.-]+$/).allow('').max(254),
      limit: Joi.number().required().max(100),
      skip: Joi.number(),
      orderBy: Joi.string(),
      isAscending: Joi.bool(),
      isActive: Joi.bool()
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

}

module.exports = StreamValidator;
