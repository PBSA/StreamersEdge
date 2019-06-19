const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('./../../../errors/validate.error');
const profileConstants = require('../../../constants/profile');

class ProfileValidator extends BaseValidator {

  /**
   * @param {AppConfig} opts.config
   * @param {UserRepository} opts.userRepository
   */
  constructor(opts) {
    super();

    this.config = opts.config;
    this.userRepository = opts.userRepository;
    this.patchProfile = this.patchProfile.bind(this);
    this.createPeerplaysAccount = this.createPeerplaysAccount.bind(this);
  }

  patchProfile() {
    const bodySchema = {
      avatar: Joi.string().uri({scheme:[/https?/]}).allow('').max(254),
      youtube: Joi.string().regex(/^https:\/\/www\.youtube\.com/).uri().allow('').max(254),
      facebook: Joi.string().regex(/^https:\/\/www\.facebook\.com/).uri().allow('').max(254),
      twitch: Joi.string().regex(/^https:\/\/www\.twitch\.tv\/[A-Za-z0-9]+$/).uri().allow('').max(254),
      peerplaysAccountName: Joi.string().allow('').max(254),
      bitcoinAddress: Joi.string().bitcoinAddress().allow(''),
      userType: Joi.string().valid(profileConstants.gamer,profileConstants.viewer,profileConstants.sponsor),
      email: Joi.string().email().allow('')
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      if (body.email && req.user.email !== body.email) {
        const exist = await this.userRepository.findOne({where: {email: body.email}});

        if (exist) {
          throw new ValidateError(400, 'Validate error', {
            email: 'Already is used'
          });
        }
      }

      return body;
    });
  }

  createPeerplaysAccount() {
    const bodySchema = {
      name: Joi.string().required().min(3).max(254),
      ownerKey: Joi.string().required().min(53).max(54),
      activeKey: Joi.string().required().min(53).max(54)
    };

    return this.validate(null, bodySchema, (req, query, body) => body);
  }

}

module.exports = ProfileValidator;
