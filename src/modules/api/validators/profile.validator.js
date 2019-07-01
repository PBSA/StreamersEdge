const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const profileConstants = require('../../../constants/profile');
const ValidateError = require('../../../errors/validate.error');

class ProfileValidator extends BaseValidator {

  /**
   * @param {PubgApiRepository} opts.pubgApiRepository
   * @param {AppConfig} opts.config
   * @param {PeerplaysRepository} opts.peerplaysRepository
   */
  constructor(opts) {
    super();

    this.pubgApiRepository = opts.pubgApiRepository;
    this.config = opts.config;
    this.peerplaysRepository = opts.peerplaysRepository;

    this.patchProfile = this.patchProfile.bind(this);
    this.createPeerplaysAccount = this.createPeerplaysAccount.bind(this);
  }

  patchProfile() {
    const bodySchema = {
      avatar: Joi.string().uri({scheme:[/https?/]}).allow('').max(254),
      youtube: Joi.string().uri({scheme: [/https?/]}).allow('').max(254),
      facebook: Joi.string().uri({scheme: [/https?/]}).allow('').max(254),
      peerplaysAccountName: Joi.string().allow('').max(254),
      bitcoinAddress: Joi.string().bitcoinAddress().allow(''),
      pubgUsername: Joi.string().allow(''),
      userType: Joi.string().valid(profileConstants.gamer,profileConstants.viewer,profileConstants.sponsor)
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {peerplaysAccountName} = body;

      if (peerplaysAccountName) {
        body.peerplaysAccountId = await this.peerplaysRepository.getAccountId(peerplaysAccountName);
      }

      if (body.pubgUsername) {
        try {
          const profile = await this.pubgApiRepository.getProfile(body.pubgUsername);
          body.pubgId = profile.id;
        } catch (e) {
          throw new ValidateError(400, 'Validate error', {
            pubgUsername: e.message
          });
        }
      } else if (body.pubgUsername === '') {
        body.pubgId = '';
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
