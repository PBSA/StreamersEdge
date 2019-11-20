const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');

class NotificationsValidator extends BaseValidator {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    super();

    this.userRepository = opts.userRepository;

    this.config = opts.config;
    this.subscribe = this.subscribe.bind(this);
  }

  subscribe() {
    const bodySchema = {
      endpoint: Joi.string().required(),
      expirationTime: Joi.number().allow(null),
      keys: Joi.object({
        p256dh: Joi.string().required(),
        auth: Joi.string().required()
      }).required()
    };

    return this.validate(null, bodySchema, (req, query, body) => body);
  }

}

module.exports = NotificationsValidator;
