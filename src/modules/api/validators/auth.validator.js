const Joi = require('./abstract/joi.form');
const normalizeEmail = require('normalize-email');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('./../../../errors/validate.error');

class AuthValidator extends BaseValidator {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {VerificationTokenRepository} opts.verificationTokenRepository
   * @param {ResetTokenRepository} opts.resetTokenRepository
   */
  constructor(opts) {
    super();

    this.userRepository = opts.userRepository;
    this.verificationTokenRepository = opts.verificationTokenRepository;
    this.resetTokenRepository = opts.resetTokenRepository;

    this.validateAuthCode = this.validateAuthCode.bind(this);
    this.validateSignUp = this.validateSignUp.bind(this);
    this.validateConfirmEmail = this.validateConfirmEmail.bind(this);
    this.validateSignIn = this.validateSignIn.bind(this);
    this.validateForgotPassword = this.validateForgotPassword.bind(this);
    this.validateResetPassword = this.validateResetPassword.bind(this);
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

  validateSignUp() {
    const bodySchema = {
      email: Joi.string().email().required(),
      username: Joi.string().regex(/^[a-z][a-z0-9-]+[a-z0-9]$/).min(3).max(36).required(),
      password: Joi.string().regex(/^[A-Za-z0-9.@!#$%^*]+$/).min(6).max(60).required(),
      repeatPassword: Joi.string().required()
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {username, password, repeatPassword} = body;

      const email = normalizeEmail(body.email);

      if (username.match(/-dividend-distribution/)) {
        throw new ValidateError(400, 'Validate error', {
          username: 'Should not include "-dividend-distribution"'
        });
      }

      if (email.match(/@.+\..+\./)) {
        throw new ValidateError(400, 'Validate error', {
          email: 'Unsupported type of email'
        });
      }

      if (password !== repeatPassword) {
        throw new ValidateError(400, 'Validate error', {
          repeatPassword: 'Should be the same as the password'
        });
      }

      const alreadyExists = await this.userRepository.getByEmailOrUsername(email, username);

      if (alreadyExists && alreadyExists.email === email) {
        throw new ValidateError(400, 'Validate error', {
          email: 'This email already is used'
        });
      }

      if (alreadyExists && alreadyExists.username === username) {
        throw new ValidateError(400, 'Validate error', {
          username: 'This username already is used'
        });
      }

      return {email, password, username};
    });
  }

  validateConfirmEmail() {
    const querySchema = {
      token: Joi.string().required()
    };

    return this.validate(querySchema, null, async (req, query) => {
      const {token} = query;

      const ActiveToken = await this.verificationTokenRepository.findActive(token);

      if (!ActiveToken) {
        throw new ValidateError(404, 'Token not found');
      }

      return ActiveToken;
    });
  }

  validateSignIn() {
    const bodySchema = {
      login: Joi.string().required(),
      password: Joi.string().required()
    };
    return this.validate(null, bodySchema, (req, query, body) => body);
  }

  validateForgotPassword() {
    const bodySchema = {
      email: Joi.string().email().required()
    };
    return this.validate(null, bodySchema, (req, query, body) => body.email);
  }

  validateResetPassword() {
    const bodySchema = {
      token: Joi.string().required(),
      password: Joi.string().regex(/^[A-Za-z0-9.@!#$%^*]+$/).min(6).max(60).required(),
      repeatPassword: Joi.string().required()
    };
    return this.validate(null, bodySchema, async (req, query, body) => {
      const {password, repeatPassword, token} = body;

      if (password !== repeatPassword) {
        throw new ValidateError(400, 'Validate error', {
          repeatPassword: 'Should be the same as the password'
        });
      }

      const ResetToken = await this.resetTokenRepository.findActive(token);

      if (!ResetToken) {
        throw new ValidateError(404, 'Token not found');
      }

      return {ResetToken, password};
    });
  }

}

module.exports = AuthValidator;
