const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const invitationConstants = require('../../../constants/invitation');

class UserValidator extends BaseValidator {

  constructor(opts) {
    super();

    this.config = opts.config;
    this.getUser = this.getUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.changeNotificationStatus = this.changeNotificationStatus.bind(this);
    this.changeInvitationStatus = this.changeInvitationStatus.bind(this);
  }

  getUser() {
    const querySchema = {
      id: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, (req, query) => query.id);
  }

  getUsers() {
    const querySchema = {
      search: Joi.string().regex(/^[a-zA-Z0-9.-]+$/).allow('').max(254),
      limit: Joi.number().required().max(100),
      skip: Joi.number()
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

  changeNotificationStatus() {
    return this.validate(null,
      {notifications: Joi.boolean()},
      (req, query, body) => body);
  }

  changeInvitationStatus() {
    const statusChecker = Joi.string().valid(...Object.keys(invitationConstants.invitationStatus));
    const usersChecker = Joi.array().items(Joi.number().integer().greater(0)).allow(null);
    const gamesChecker = Joi.array().items(Joi.string()).allow(null);
    return this.validate(null,
      {invitations: statusChecker, users: usersChecker, games: gamesChecker},
      (req, query, body) => body);
  }

}

module.exports = UserValidator;
