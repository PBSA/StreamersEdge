const Joi = require('./joi.form');

module.exports = Joi.object().keys({
  ref_block_num: Joi.number().required(),
  ref_block_prefix: Joi.number().required(),
  expiration: Joi.string().required(),
  operations: Joi.array().length(1).items(Joi.array().length(2).items(Joi.number().integer(), Joi.object().keys({
    fee: Joi.object().keys({
      amount: Joi.string().required(),
      asset_id: Joi.string().required()
    }).required(),
    from: Joi.string().required(),
    to: Joi.string().required(),
    amount: Joi.object().keys({
      amount: Joi.string().required(),
      asset_id: Joi.string().required()
    }).required(),
    extensions: Joi.array()
  }))).required(),
  extensions: Joi.array().required(),
  signatures: Joi.array().required()
});
