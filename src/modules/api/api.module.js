const logger = require('log4js').getLogger('api.module.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const passport = require('passport');

const MethodNotAllowedError = require('../../errors/method-not-allowed.error');
const RestError = require('../../errors/rest.error');

/**
 * A namespace.
 * @namespace api
 * @class ApiModule
 */
class ApiModule {

	/**
	 *
	 * @param {AppConfig} opts.config
	 * @param {AuthController} opts.authController
	 * @param {ProfileController} opts.profileController
	 * @param {UserController} opts.userController
	 * @param {UserRepository} opts.userRepository
	 */
	constructor(opts) {
		this.config = opts.config;
		this.app = null;
		this.server = null;

		this.authController = opts.authController;
		this.profileController = opts.profileController;
		this.userController = opts.userController;

		this.userRepository = opts.userRepository;
	}

	/**
	 * Start HTTP server listener
	 * @return {Promise<void>}
	 */
	initModule() {
		return new Promise((resolve) => {
			logger.trace('Start HTTP server initialization');
			const sessionStore = new MongoStore({ mongooseConnection: mongoose.connection });

			this.app = express();
			this.app.use(bodyParser.urlencoded({ extended: true }));
			this.app.use(bodyParser.json());

			if (this.config.cors) {
				const corsOptions = {
					origin: (origin, callback) => {
						callback(null, true);
					},
					credentials: true,
					methods: ['GET', 'PUT', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
					headers: ['x-user', 'X-Signature', 'accept', 'content-type'],
				};

				this.app.use(cors(corsOptions));
				this.app.options('*', cors());
			}

			this.app.use(session({
				name: 'crypto.sid',
				secret: this.config.sessionSecret,
				cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }, // 7 days
				resave: false,
				saveUninitialized: false,
				rolling: true,
				store: sessionStore,
			}));

			this.app.use(passport.initialize());
			this.app.use(passport.session());

			passport.serializeUser((user, done) => done(null, user._id));
			passport.deserializeUser((user, done) => {
				this.userRepository.findById(user).then((_user) => done(null, _user));
			});

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
			this.userController,
		].forEach((controller) => controller.getRoutes().forEach((route) => this.addRestHandler(...route)));

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

				const result = await action(req.user, req.pure, req);
				return res.status(200).json({
					result: result || null,
					status: 200,
				});
			} catch (error) {
				let restError = error;
				if (!(error instanceof RestError)) {
					logger.error(error);
					restError = {
						status: 500,
						message: 'server side error',
					};
				}
				return res.status(restError.status).json({
					error: restError.details || restError.message,
					status: restError.status,
				});
			}
		});
	}

	close() {
		this.server.close();
	}

}

module.exports = ApiModule;
