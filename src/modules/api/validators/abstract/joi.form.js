const baseJoi = require('joi');

const objectId = (joi) => ({
	name: 'string',
	base: joi.string(),
	language: {
		objectId: 'Id has invalid format',
	},
	rules: [{
		name: 'objectId',
		validate(params, value, state, options) {
			if (value.search(/^[0-9a-fA-F]{24}$/) === -1) {
				return this.createError('string.objectId', { value }, state, options);
			}
			return value;
		},
	}],
});

module.exports = baseJoi.extend(objectId);
