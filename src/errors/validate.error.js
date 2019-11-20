const RestError = require('./rest.error');

/**
 * @swagger
 *
 * definitions:
 *  ValidateError:
 *    type: object
 *    properties:
 *      status:
 *        type: number
 *        example: 400
 *      error:
 *        type: object
 *  UnauthorizedError:
 *    type: object
 *    properties:
 *      status:
 *        type: number
 *        example: 401
 *      error:
 *        type: string
 *        example: unauthorized
 *  ForbiddenError:
 *    type: object
 *    properties:
 *      status:
 *        type: number
 *        example: 403
 *      error:
 *        type: string
 *        example: forbidden
 *  UnProcessableError:
 *    type: object
 *    properties:
 *      status:
 *        type: number
 *        example: 422
 *      error:
 *        type: string
 *        example: unprocessable
 */

class ValidateError extends RestError {

  constructor(status = 400, message = 'Validate error', formErrors = null) {
    super(message, status, formErrors);
  }

  static validateError(formErrors = null) {
    return new ValidateError(400, 'Validate error', formErrors);
  }

}

module.exports = ValidateError;
