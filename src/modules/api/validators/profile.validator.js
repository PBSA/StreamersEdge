const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('./../../../errors/validate.error');
const profileConstants = require('../../../constants/profile');
const awaitTo = require('async-await-error-handling');

class ProfileValidator extends BaseValidator {

  /**
   * @param {AppConfig} opts.config
   * @param {AppConfig} opts.config
   * @param {PeerplaysRepository} opts.peerplaysRepository
   * @param {UserRepository} opts.userRepository
   * @param {PubgApiRepository} opts.pubgApiRepository
   */
  constructor(opts) {
    super();

    this.pubgApiRepository = opts.pubgApiRepository;
    this.config = opts.config;
    this.peerplaysRepository = opts.peerplaysRepository;

    this.userRepository = opts.userRepository;
    this.patchProfile = this.patchProfile.bind(this);
    this.createPeerplaysAccount = this.createPeerplaysAccount.bind(this);
  }

  patchProfile() {
    const bodySchema = {
      avatar: Joi.string().uri({scheme: [/https?/]}).allow('').max(254),
      youtube: Joi.string().regex(/^https:\/\/www\.youtube\.com/).uri().allow('').max(254),
      facebook: Joi.string().regex(/^https:\/\/www\.facebook\.com/).uri().allow('').max(254),
      twitch: Joi.string().regex(/^https:\/\/www\.twitch\.tv\/[A-Za-z0-9]+$/).uri().allow('').max(254),
      peerplaysAccountName: Joi.string().allow('').max(63),
      googleName: Joi.string().allow(''),
      twitchUserName: Joi.string().allow(''),
      twitchId: Joi.string().allow(null),
      googleId: Joi.string().allow(null),
      facebookId: Joi.string().allow(null),
      bitcoinAddress: Joi.string().bitcoinAddress().allow(''),
      pubgUsername: Joi.string().allow(''),
      userType: Joi.string().valid(profileConstants.gamer, profileConstants.viewer, profileConstants.sponsor),
      email: Joi.string().email().allow(''),
      username: Joi.string().allow('')
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {peerplaysAccountName} = body;

      if (peerplaysAccountName) {
        body.peerplaysAccountId = await this.peerplaysRepository.getAccountId(peerplaysAccountName);
      }

      if (body.username) {
        throw ValidateError.validateError({username: 'Username update is not allowed'});
      }

      if (body.email && req.user.email !== body.email) {
        const exist = await this.userRepository.model.findOne({where: {email: body.email}});

        if (exist) {
          throw ValidateError.validateError({email: 'Already used'});
        }
      }

      if (body.googleName && req.user.googleName !== body.googleName) {
        const exist = await this.userRepository.model.findOne({where: {googleName: body.googleName}});

        if (exist) {
          throw ValidateError.validateError({googleName: 'Already used'});
        }
      }

      if (body.twitchUserName && req.user.twitchUserName !== body.twitchUserName) {
        const exist = await this.userRepository.model.findOne({where: {twitchUserName: body.twitchUserName}});

        if (exist) {
          throw ValidateError.validateError({twitchUserName: 'Already used'});
        }
      }

      if (body.pubgUsername) {
        const [err, profile] = await awaitTo(this.pubgApiRepository.getProfile(body.pubgUsername));

        if (err) {
          throw ValidateError.validateError({pubgUsername: err.message});
        }

        body.pubgId = profile.id;

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
