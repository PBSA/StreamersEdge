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
  }

  createChallenge() {
    const bodySchema = {
      name: Joi.string().max(50).required(),
      startDate: Joi.date().iso().min('now'),
      endDate: Joi.date().iso().min('now'),
      game: Joi.string().valid(challengeConstants.games).required(),
      accessRule: Joi.string().valid(Object.keys(challengeConstants.accessRules)).required(),
      ppyAmount: Joi.number().min(1).required(),
      invitedAccounts: Joi.array().items(Joi.number()).default([], 'empty array'),
      params: Joi.object().keys({
        shouldLead: Joi.boolean(),
        shouldKill: Joi.number().min(1),
        shouldWinPerTime: Joi.number().min(1),
        minPlace: Joi.number().min(1)
      }).default({}, 'empty object')
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

      if (
        !body.params.shouldLead &&
        !body.params.shouldKill &&
        !body.params.shouldWinPerTime &&
        !body.params.minPlace
      ) {
        throw new ValidateError(400, 'Validate error', {
          params: 'You must specify the criteria for challenge'
        });
      }

      return body;
    });
  }

}

module.exports = ChallengeValidator;
