const awilix = require('awilix');
/** @type AppConfig */
const CONFIG = require('config');
const { getLogger } = require('log4js');

const {
	Lifetime, InjectionMode, asClass, listModules, asValue,
} = awilix;

const logger = getLogger();
logger.level = CONFIG.logger.level || 'info';

// create awilix container
const container = awilix.createContainer({
	injectionMode: InjectionMode.PROXY,
});

// load modules
container.loadModules([
	['services/*.js', { register: asClass }],
	['helpers/*.js', { register: asClass }],
	['connections/*.js', { register: asClass }],
	['repositories/*.js', { register: asClass }],
	['modules/*/*.js', { register: asClass }],
], {
	formatName: 'camelCase',
	resolverOptions: {
		lifetime: Lifetime.SINGLETON,
		injectionMode: InjectionMode.PROXY,
	},
});

// init workers with proxy mode for simple prototyping
container.loadModules([
	['workers/*.js', { register: asClass }],
], {
	formatName: 'camelCase',
	resolverOptions: {
		lifetime: Lifetime.SINGLETON,
		injectionMode: InjectionMode.PROXY,
	},
});

CONFIG.isDevelopment = process.env.NODE_ENV === 'development';

container.register({
	config: asValue(CONFIG),
	basePath: asValue(__dirname),
});

listModules(['modules/*/*.js']).forEach(({ name }) => {
	const scope = container.createScope();
	scope.loadModules([
		[`modules/${name.replace(/\.[a-z]+$/, '')}/*/*.js`, { register: asClass }],
	], {
		formatName: 'camelCase',
		resolverOptions: {
			lifetime: Lifetime.SCOPED,
			injectionMode: InjectionMode.PROXY,
		},
	});
});

async function initModule(name, mode) {
	const scope = container.createScope();
	scope.loadModules([
		[`modules/${name.replace(/\.[a-z]+$/, '')}/*/*.js`, { register: asClass }],
	], {
		formatName: 'camelCase',
		resolverOptions: {
			lifetime: Lifetime.SCOPED,
			resolutionMode: InjectionMode.PROXY,
		},
	});
	const module = scope.resolve(name.replace(/\.([a-z])/, (a) => a[1].toUpperCase()));
	if (typeof module.initModule !== 'function') {
		logger.warn(`module ${name} not contain a method 'initModule'`);
		return null;
	}
	logger.info(`Init ${name.replace(/\.[a-z]+$/, '')} module`);
	try {
		await module.initModule(mode);
	} catch (err) {
		logger.error(`init ${name} module error`);
		logger.error(err);
	}
	return module;
}

module.exports = {
	initModule,
	container,
};
