const Joi = require('./abstract/joi.form');
const tldJS = require('tldjs');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('./../../../errors/validate.error');
const profileConstants = require('../../../constants/profile');
const tokenConstants = require('../../../constants/token');

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
    this.peerplaysRepository = opts.peerplaysRepository;

    this.validateAuthCode = this.validateAuthCode.bind(this);
    this.validateSignUp = this.validateSignUp.bind(this);
    this.validateConfirmEmail = this.validateConfirmEmail.bind(this);
    this.validateSignIn = this.validateSignIn.bind(this);
    this.validateForgotPassword = this.validateForgotPassword.bind(this);
    this.validateResetPassword = this.validateResetPassword.bind(this);
    this.loggedOnly = this.loggedOnly.bind(this);
    this.loggedAdminOnly = this.loggedAdminOnly.bind(this);
    this.validatePeerplaysLogin = this.validatePeerplaysLogin.bind(this);
    this.validatePaypalAuth = this.validatePaypalAuth.bind(this);
  }

  loggedOnly() {
    return this.validate(null, null, async (req) => {

      if (!req.isAuthenticated()) {
        throw new ValidateError(401, 'unauthorized');
      }

      return null;
    });
  }

  loggedAdminOnly() {
    return this.validate(null, null, async (req) => {

      if (!req.isAuthenticated()) {
        throw new ValidateError(401, 'unauthorized');
      }

      if (req.user.userType !== profileConstants.userType.admin) {
        throw new ValidateError(403, 'forbidden');
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
      username: Joi.string().regex(/^[a-z][a-z0-9-]+[a-z0-9]$/).min(3).max(60).required(),
      password: Joi.string().regex(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])[a-zA-Z0-9!@#\$%\^&\*]+$/).min(6).max(60).required(),
      repeatPassword: Joi.string().required()
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {username, password, repeatPassword, email} = body;

      if (username.match(/-dividend-distribution/)) {
        throw new ValidateError(400, 'Validate error', {
          username: 'Should not include "-dividend-distribution"'
        });
      }

      if (email.match(/@.+\..+/) && (!tldJS.tldExists(email) || (email.split('@').pop().split('.').length > 2))) {
        throw new ValidateError(400, 'Validate error', {
          email: 'Invalid email'
        });
      }

      if (password !== repeatPassword) {
        throw new ValidateError(400, 'Validate error', {
          repeatPassword: 'Should be the same as the password'
        });
      }

      const alreadyExists = await this.userRepository.getByEmailOrUsername(email.toLowerCase(), username);

      if (alreadyExists && alreadyExists.email === email.toLowerCase()) {
        throw new ValidateError(400, 'Validate error', {
          email: 'This email is already used'
        });
      }

      if (alreadyExists && alreadyExists.username === username) {
        throw new ValidateError(400, 'Validate error', {
          username: 'This username is already used'
        });
      }

      const peerplaysUser = await this.peerplaysRepository.getAccountId(`se-${username}`);

      if(peerplaysUser!=null) {
        throw new ValidateError(400,'Validate error', {
          username: `Peerplays account exists with the username se-${username}`
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
        throw new ValidateError(404, tokenConstants.tokenNotFound);
      }

      return ActiveToken;
    });
  }

  validateSignIn() {
    const bodySchema = {
      login: Joi.string().required(),
      password: Joi.string().required()
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {login} = body;

      const user = await this.userRepository.getByLogin(login);

      if(user && user.isEmailVerified === false){
        throw new ValidateError(403, 'Please verify your email address first');
      }

      if (user && user.status === profileConstants.status.banned) {
        throw new ValidateError(403, 'You have been banned. Please contact our admins for potential unban.');
      }

      return body;
    });
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
        throw new ValidateError(404, tokenConstants.tokenNotFound);
      }

      return {ResetToken, password};
    });
  }

  validatePeerplaysLogin() {
    const bodySchema = {
      login: Joi.string().required(),
      password: Joi.string().required().min(12)
    };
    
    return this.validate(null, bodySchema, async (req, query, body) => body);
  }

  validatePaypalAuth() {
    const querySchema = { 
      callbackUrl: Joi.string().required()
    };

    return this.validate(querySchema, null, async (req, query) => query);
  }
}

module.exports = AuthValidator;
