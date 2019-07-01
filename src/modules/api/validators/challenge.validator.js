const Joi = require('./abstract/joi.form');
const moment = require('moment');
const BaseValidator = require('./abstract/base.validator');
const challengeConstants = require('../../../constants/challenge');
const ValidateError = require('../../../errors/validate.error');

class ChallengeValidator extends BaseValidator {

  /**
   * @param {UserRepository} opts.userRepository
   */
  constructor(opts) {
    super();

    this.userRepository = opts.userRepository;

    this.config = opts.config;
    this.createChallenge = this.createChallenge.bind(this);
    this.validateGetChallenge = this.validateGetChallenge.bind(this);
  }

  createChallenge() {
    const bodySchema = {
      name: Joi.string().max(50).required(),
      startDate: Joi.date().iso().min('now'),
      endDate: Joi.date().iso().min('now').required(),
      game: Joi.string().valid(challengeConstants.games).required(),
      accessRule: Joi.string().valid(Object.keys(challengeConstants.accessRules)).required(),
      ppyAmount: Joi.number().min(1).required(),
      invitedAccounts: Joi.array().items(Joi.number()).default([], 'empty array'),
      conditionsText: Joi.string().max(254).allow('').default('', 'empty string'),
      conditions: Joi.array().items(Joi.object().keys({
        param: Joi.string().valid(Object.keys(challengeConstants.paramTypes)).required(),
        operator: Joi.string().valid(challengeConstants.operators).required(),
        value: Joi.number().integer().required(),
        join: Joi.string().valid(challengeConstants.joinTypes).required()
      })).default([], 'empty array')
    };

    return this.validate(null, bodySchema, async (req, query, body) => {

      if (body.accessRule === challengeConstants.accessRules.invite) {
        if (body.invitedAccounts.length === 0) {
          throw new ValidateError(400, 'Validate error', {
            invitedAccounts: 'Accounts must be specified'
          });
        }

        const Users = await this.userRepository.findByPkList(body.invitedAccounts);

        if (Users.length !== body.invitedAccounts.length) {
          throw new ValidateError(400, 'Validate error', {
            invitedAccounts: 'Accounts with specified ids have not been found'
          });
        }
      }

      if (body.startDate && body.endDate) {
        if (moment(body.endDate).diff(body.startDate) <= 0) {
          throw new ValidateError(400, 'Validate error', {
            endDate: 'End date should be greater than start date'
          });
        }
      }

      const endCriteria = body.conditions.filter((row) => row.join === 'END');

      if (endCriteria.length > 1) {
        throw new ValidateError(400, 'Validate error', {
          conditions: '\'end\' criteria cannot be used more than once'
        });
      }

      if (!body.conditions.length && body.conditionsText === '') {
        throw new ValidateError(400, 'Validate error', {
          conditions: 'You must specify the criteria or conditions description'
        });
      }

      return body;
    });
  }

  validateGetChallenge() {
    const querySchema = {
      id: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, (req, query) => query.id);
  }

}

module.exports = ChallengeValidator;
