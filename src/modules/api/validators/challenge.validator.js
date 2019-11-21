const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const challengeConstants = require('../../../constants/challenge');
const ValidateError = require('../../../errors/validate.error');
const operationSchema = require('./abstract/operation.schema');

class ChallengeValidator extends BaseValidator {

  /**
   * @param {UserRepository} opts.userRepository
   * @param {AppConfig} opts.config
   */
  constructor(opts) {
    super();

    this.userRepository = opts.userRepository;
    this.peerplaysConnection = opts.peerplaysConnection;
    this.config = opts.config;
    this.createChallenge = this.createChallenge.bind(this);
    this.getAllChallenges = this.getAllChallenges.bind(this);
    this.getWonChallenges = this.getWonChallenges.bind(this);
    this.validateGetChallenge = this.validateGetChallenge.bind(this);
    this.invite = this.invite.bind(this);
    this.joinToChallenge = this.joinToChallenge.bind(this);
  }

  createChallenge() {
    const bodySchema = {
      name: Joi.string().max(50).required(),
      timeToStart: Joi.date().iso().min('now').required(),
      game: Joi.string().valid(challengeConstants.games).required(),
      conditionsText: Joi.string().max(254).allow('').default('', 'empty string'),
      conditions: Joi.array().items(Joi.object().keys({
        param: Joi.string().valid(Object.keys(challengeConstants.paramTypes)).required(),
        operator: Joi.string().valid(challengeConstants.operators).required(),
        value: Joi.number().integer().required(),
        join: Joi.string().valid(challengeConstants.joinTypes).required()
      })).default([], 'empty array')
    };

    return this.validate(null, bodySchema, async (req, query, body) => {

      if (!body.conditions.length && body.conditionsText === '') {
        throw new ValidateError(400, 'Validate error', {
          conditions: 'You must specify the criteria or conditions description'
        });
      }

      body.conditions.forEach((condition, index) => {
        if ((index < body.conditions.length - 1) && condition.join === 'END') {
          throw new ValidateError(400, 'Validate error', {
            conditions: 'Only the last condition\'s join property can equal "END"'
          });
        } else if ((index === body.conditions.length - 1) && condition.join !== 'END') {
          throw new ValidateError(400, 'Validate error', {
            conditions: 'The last condition\'s join property must equal "END"'
          });
        }
      });

      return body;
    });
  }

  getAllChallenges() {
    const querySchema = {
      order: Joi.string().allow(''),
      searchText: Joi.string().allow('')
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

  getWonChallenges() {
    const querySchema = {
      userId: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, (req, query) => query.userId);
  }

  validateGetChallenge() {
    const querySchema = {
      id: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, (req, query) => query.id);
  }

  invite() {
    const bodySchema = {
      userId: Joi.number().required(),
      challengeId: Joi.number().required()
    };

    return this.validate(null, bodySchema, (req, query, body) => body);
  }

  joinToChallenge() {
    return this.validate(null,
      {
        challengeId: Joi.number().integer().required(),
        joinOp: operationSchema
      },
      (req, query, body) => body);
  }

}

module.exports = ChallengeValidator;
