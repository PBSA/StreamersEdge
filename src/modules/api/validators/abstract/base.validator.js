const Joi = require('./../abstract/joi.form');
const ValidateError = require('../../../../errors/validate.error');

class BaseValidator {

  /**
	 * This method has two steps - at first it validate and clear body and query object
	 * and after prepare req.pure object if prepare method does not empty
	 * @param {Object|null} queryJoiSchema  Object, where key is key in query object and value is Joi scheme
	 * Example:
	 *  {
	 *      title: Joi.string().required(),
			position: Joi.number().integer().min(0).max(1000),
	 *  }
	 * @param {Object|null} bodyJoiSchema   The same as queryJoiSchema but for body object
	 * @param {Function} prepare            Function that returns Promise. Should expect 3 parameters:
	 *      - req - a request object
	 *      - query - a pure object from query, based on queryJoiSchema validation
	 *      - body - a pure object from body, based on bodyJoiSchema validation
	 *      The promise should return an pure object witch will be sent into controller as req.pure
	 *      also you can throw error inside pure function
	 * @returns {Function}
	 */
  validate(queryJoiSchema, bodyJoiSchema, prepare) {
    const schemas = {
      query: queryJoiSchema,
      body: bodyJoiSchema
    };

    return async (req) => {
      ['query', 'body'].forEach((key) => {
        if (!schemas[key]) {
          return;
        }

        let obj = req[key];

        if (key === 'query') {
          obj = Object.assign(obj, req.params);
        }

        const {result, errors} = this._validateWithJoi(schemas[key], obj);

        if (Object.keys(errors).length) {
          throw new ValidateError(400, `Validate ${key} error`, errors);
        }

        req[key] = result;
      });

      if (prepare) {
        try {
          req.pure = await prepare(req, req.query, req.body);
        } catch (e) {
          throw new ValidateError(e.status || 400, e.message, e.details || e.message);
        }
      }
    };
  }

  _validateWithJoi(schemas, object) {
    const result = {};
    const errors = {};
    Object.keys(schemas).forEach((key) => {
      const {error, value} = Joi.validate(object[key], schemas[key]);

      if (error) {
        /* eslint-disable-next-line prefer-destructuring */
        errors[key] = error.message.match(/\[(.+)\]/) ? error.message.match(/\[(.+)\]/)[1] : error.message;
      } else if (Object.keys(object).includes(key)) {
        result[key] = value;
      }
    });
    return {
      result,
      errors
    };
  }

}

module.exports = BaseValidator;
