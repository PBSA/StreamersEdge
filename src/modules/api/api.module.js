const logger = require('log4js').getLogger('api.module.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
let swaggerDef = require('./swagger-definition.js');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const path = require('path');

const MethodNotAllowedError = require('../../errors/method-not-allowed.error');
const RestError = require('../../errors/rest.error');
/**
 * @swagger
 *
 * definitions:
 *  SuccessResponse:
 *    type: object
 *    properties:
 *      status:
 *        type: number
 *        default: 200
 *        example: 200
 *  SuccessEmptyResponse:
 *    allOf:
 *      - $ref: '#/definitions/SuccessResponse'
 *      - type: object
 *        properties:
 *          result:
 *            type: boolean
 *            example: true
 */
/**
 * A namespace.
 * @namespace api
 * @class ApiModule
 */
class ApiModule {

  /**
   *
   * @param {DbConnection} opts.dbConnection
   * @param {SmtpConnection} opts.smtpConnection
   * @param {AuthController} opts.authController
   * @param {ProfileController} opts.profileController
   * @param {UsersController} opts.usersController
   * @param {TwitchController} opts.twitchController
   * @param {GoogleController} opts.googleController
   * @param {FacebookController} opts.facebookController
   * @param {UserRepository} opts.userRepository
   * @param {ChallengesController} opts.challengesController
   * @param {PaymentController} opts.paymentController
   * @param {AdminController} opts.adminController
   * @param {SteamController} opts.steamController
   */
  constructor(opts) {
    this.config = opts.config;
    this.dbConnection = opts.dbConnection;
    this.smtpConnection = opts.smtpConnection;
    this.app = null;
    this.server = null;

    this.authController = opts.authController;
    this.profileController = opts.profileController;
    this.usersController = opts.usersController;
    this.twitchController = opts.twitchController;
    this.facebookController = opts.facebookController;
    this.googleController = opts.googleController;
    this.challengesController = opts.challengesController;
    this.paymentController = opts.paymentController;
    this.streamController = opts.streamController;
    this.adminController = opts.adminController;
    this.steamController = opts.steamController;

    this.userRepository = opts.userRepository;
  }

  /**
   * Start HTTP server listener
   * @return {Promise<void>}
   */
  initModule() {
    return new Promise((resolve) => {
      logger.trace('Start HTTP server initialization');

      this.app = express();
      this.app.use(bodyParser.urlencoded({extended: true}));
      this.app.use(bodyParser.json());

      if (this.config.cors) {
        const corsOptions = {
          origin: (origin, callback) => {
            callback(null, true);
          },
          credentials: true,
          methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
          headers: ['x-user', 'X-Signature', 'accept', 'content-type']
        };

        this.app.use(cors(corsOptions));
        this.app.options('*', cors());
      }

      const SessionStore = new SequelizeStore({
        db: this.dbConnection.sequelize
      });

      this.app.use(session({
        name: 'crypto.sid',
        secret: this.config.sessionSecret,
        cookie: {maxAge: 7 * 24 * 60 * 60 * 1000}, // 7 days
        resave: false,
        saveUninitialized: false,
        rolling: true,
        store: SessionStore
      }));

      SessionStore.sync();

      this.app.use(passport.initialize());
      this.app.use(passport.session());
      this.app.use(express.static(path.join(__dirname, '../../push-notifications')));

      passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      passport.deserializeUser((user, done) => {
        this.userRepository.findByPk(user).then((_user) => {
          done(null, _user);
        });
      });

      if (process.env.NODE_ENV != 'production') {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc({
          definition: swaggerDef,
          apis: swaggerDef.apis
        })));
      }

      this.server = this.app.listen(this.config.port, () => {
        logger.info(`API APP REST listen ${this.config.port} Port`);
        this._initRestRoutes();
        resolve();
      });
    });
  }

  /**
   * Bind routers
   */
  _initRestRoutes() {
    [
      this.authController,
      this.profileController,
      this.usersController,
      this.challengesController,
      this.twitchController,
      this.facebookController,
      this.googleController,
      this.challengesController,
      this.paymentController,
      this.steamController,
      this.streamController,
      this.adminController,
      this.steamController
    ].forEach((controller) => controller.getRoutes(this.app).forEach((route) => {
      this.addRestHandler(...route);
    }));

    this.addRestHandler('use', '*', () => {
      throw new MethodNotAllowedError();
    });
  }

  /** @typedef {('get','post','patch','use')} Method */

  /**
   * @param {Method} method
   * @param {String} route
   * @param args
   */
  addRestHandler(method, route, ...args) {
    const action = args.pop();
    this.app[method](route, async (req, res) => {
      try {
        await args.reduce(async (previousPromise, handler) => {
          await previousPromise;
          return handler()(req, res);
        }, Promise.resolve());

        const result = await action(req.user, req.pure, req, res);
        return res.status(200).json({
          result: result || null,
          status: 200
        });
      } catch (error) {
        let restError = error;

        if (!(error instanceof RestError)) {
          /* istanbul ignore next */
          logger.error(error);
          /* istanbul ignore next */
          restError = {
            status: 500,
            message: 'server side error'
          };
        }

        return res.status(restError.status).json({
          error: restError.details || restError.message,
          status: restError.status
        });
      }
    });
  }

  close() {
    this.server.close();
  }

}

module.exports = ApiModule;
