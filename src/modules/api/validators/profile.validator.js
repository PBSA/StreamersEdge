const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');

class ProfileValidator extends BaseValidator {

  constructor(opts) {
    super();

    this.config = opts.config;
    this.patchProfile = this.patchProfile.bind(this);
    this.createPeerplaysAccount = this.createPeerplaysAccount.bind(this);
  }

  patchProfile() {
    const bodySchema = {
      youtube: Joi.string().uri({scheme: [/https?/]}).allow('').max(254),
      facebook: Joi.string().uri({scheme: [/https?/]}).allow('').max(254),
      peerplaysAccountName: Joi.string().allow('').max(254),
      bitcoinAddress: Joi.string().bitcoinAddress().allow('')
    };

    return this.validate(null, bodySchema, (req, query, body) => body);
  }

  createPeerplaysAccount() {
    const bodySchema = {
      name: Joi.string().required().min(3).max(254),
      ownerKey: Joi.string().required().length(53),
      activeKey: Joi.string().required().length(53)
    };

    return this.validate(null, bodySchema, (req, query, body) => body);
  }

}

module.exports = ProfileValidator;
