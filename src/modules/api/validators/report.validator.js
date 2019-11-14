const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('./../../../errors/validate.error');
const profileConstants = require('../../../constants/profile');

class ReportValidator extends BaseValidator {
  constructor(opts) {
    super();

    this.userRepository = opts.userRepository;

    this.createReportValidation = this.createReportValidation.bind(this);
  }

  createReportValidation() {
    const bodySchema = {
      reportedUserId: Joi.number().integer().required(),
      reason: Joi.string().valid(Object.values(profileConstants.reportType)).required(),
      description: Joi.string().min(24).max(1000).required(),
      videoUrl: Joi.string()
    };

    return this.validate(null, bodySchema, async (req, query, body) => {
      const {reportedUserId} = body;

      const reportedUser = await this.userRepository.findByPk(reportedUserId);

      if (reportedUserId === req.user.id) {
        throw new ValidateError(400, 'Validate error', {email: 'There are no chance to report your account'});
      }

      if (!reportedUser) {
        throw new ValidateError(404, 'Validate error', {email: 'Reported user does not exist'});
      }

      return body;
    });
  }
}

module.exports = ReportValidator;
