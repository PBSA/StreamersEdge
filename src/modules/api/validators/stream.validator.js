const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const streamConstants = require('../../../constants/stream');

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

    return this.validate(querySchema, null, (req, query) => query.streamId);
  }

  validateGetStreams() {
    const querySchema = {
      search: Joi.string().regex(/^[a-zA-Z0-9.-]+$/).allow('').max(254),
      limit: Joi.number().max(100).default(20),
      skip: Joi.number().default(0),
      orderBy: Joi.string().valid(streamConstants.orderByTypes).default('id'),
      isAscending: Joi.bool().default(true),
      isActive: Joi.bool().default(true)
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

}

module.exports = StreamValidator;
