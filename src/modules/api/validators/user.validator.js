const Joi = require('./abstract/joi.form');
const BaseValidator = require('./abstract/base.validator');
const ValidateError = require('./../../../errors/validate.error');
const profileConstants = require('../../../constants/profile');

class UserValidator extends BaseValidator {

  /**
   * @param {AppConfig} opts.config
   * @param {UserRepository} opts.userRepository
   * @param {BanHistoryRepository} opts.banHistoryRepository
   */
  constructor(opts) {
    super();

    this.userRepository = opts.userRepository;
    this.banHistoryRepository = opts.banHistoryRepository;

    this.config = opts.config;
    this.getUser = this.getUser.bind(this);
    this.getUsers = this.getUsers.bind(this);
    this.banUser = this.banUser.bind(this);
    this.getUsersWithBansHistory = this.getUsersWithBansHistory.bind(this);
    this.changeNotificationStatus = this.changeNotificationStatus.bind(this);
    this.unbanUser = this.unbanUser.bind(this);
    this.getReports = this.getReports.bind(this);
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
      limit: Joi.number().required().min(1).max(100).default(20),
      skip: Joi.number().integer().min(0).default(0)
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

  banUser() {
    const querySchema = {
      userId: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, async (req, query) => {
      const {userId} = query;
      await this.getAdminUserById(userId);
      const [alreadyExist] = await this.banHistoryRepository.findLastEntryByUserId(userId);

      if (alreadyExist && !alreadyExist.unbannedById) {
        throw new ValidateError(400, 'Validate error', {
          email: 'This user is not yet unban'
        });
      }

      return userId;
    });
  }

  unbanUser() {
    const querySchema = {
      userId: Joi.number().integer().required()
    };

    return this.validate(querySchema, null, async (req, query) => {
      const {userId} = query;
      await this.getAdminUserById(userId);
      const [alreadyExist] = await this.banHistoryRepository.findLastEntryByUserId(userId);

      if (!alreadyExist || alreadyExist.unbannedById) {
        throw new ValidateError(400, 'Validate error', {
          email: 'This user is not yet ban'
        });
      }

      return userId;
    });
  }

  async getAdminUserById(userId) {
    const user = await this.userRepository.findByPk(userId);

    if (!user) {
      throw new ValidateError(404, 'Validate error', {
        email: 'This user does not exist'
      });
    }

    if (user.userType === profileConstants.userType.admin) {
      throw new ValidateError(403, 'Validate error', {
        email: 'This user is admin'
      });
    }

    return user;
  }

  getUsersWithBansHistory() {
    const {
      status: {
        banned,
        active
      }
    } = profileConstants;

    const querySchema = {
      flag: Joi.string().valid([banned, active]),
      search: Joi.string().regex(/^[a-zA-Z0-9.\-@]+$/).allow('').max(254),
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().min(1).max(100).default(20)
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

  changeNotificationStatus() {
    return this.validate(null,
      {notifications: Joi.alternatives().try(Joi.string(), Joi.number().integer(), Joi.boolean()).required()},
      (req, query, body) => body);
  }

  getReports() {
    const querySchema = {
      search: Joi.string().regex(/^[a-zA-Z0-9.-]+$/).allow('').max(254),
      offset: Joi.number().integer().min(0),
      limit: Joi.number().integer().min(1).max(100).default(20)
    };

    return this.validate(querySchema, null, (req, query) => query);
  }

}

module.exports = UserValidator;
