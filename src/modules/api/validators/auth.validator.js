const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('./../../../errors/validate.error');

class AuthValidator extends BaseValidator {

  constructor() {
    super();

    this.validateAuthCode = this.validateAuthCode.bind(this);
    this.loggedOnly = this.loggedOnly.bind(this);
  }

  loggedOnly() {
    return this.validate(null, null, async (req) => {

      if (!req.isAuthenticated()) {
        throw new ValidateError(401, 'unauthorized');
      }

      return null;
    });
  }

  validateAuthCode() {
    const bodySchema = {
      code: Joi.string().required()
    };

    return this.validate(null, bodySchema, (req, query, body) => body.code);
  }

}

module.exports = AuthValidator;
