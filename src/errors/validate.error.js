const RestError = require('./rest.error');

class ValidateError extends RestError {

  constructor(status = 400, message = 'Validate error', formErrors = null) {
    super(message, status, formErrors);
  }

  // add(key, error) {
  // 	if (!error || !error.length) return this;
  // 	if (!this.details || typeof this.details !== 'object') this.details = {};
  // 	if (!this.details[key]) this.details[key] = [];
  // 	this.details[key].push(...(Array.isArray(error) ? error : [error]));
  // 	return this;
  // }
  //
  // isEmpty() {
  // 	return !this.details;
  // }

}

module.exports = ValidateError;
