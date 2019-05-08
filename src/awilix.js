const awilix = require('awilix');
/** @type AppConfig */
const CONFIG = require('config');
const {getLogger} = require('log4js');

const {
  Lifetime, InjectionMode, asClass, listModules, asValue
} = awilix;

const logger = getLogger();
logger.level = CONFIG.logLevel;

// create awilix container
const container = awilix.createContainer({
  injectionMode: InjectionMode.PROXY
});

// load modules
container.loadModules([
  ['src/services/*.js', {register: asClass}],
  ['src/helpers/*.js', {register: asClass}],
  ['src/connections/*.js', {register: asClass}],
  ['src/repositories/*.js', {register: asClass}],
  ['src/modules/*/*.js', {register: asClass}]
], {
  formatName: 'camelCase',
  resolverOptions: {
    lifetime: Lifetime.SINGLETON,
    injectionMode: InjectionMode.PROXY
  }
});

// init workers with proxy mode for simple prototyping
container.loadModules([
  ['workers/*.js', {register: asClass}]
], {
  formatName: 'camelCase',
  resolverOptions: {
    lifetime: Lifetime.SINGLETON,
    injectionMode: InjectionMode.PROXY
  }
});

CONFIG.isDevelopment = process.env.NODE_ENV === 'development';

container.register({
  config: asValue(CONFIG),
  basePath: asValue(__dirname)
});

listModules(['src/modules/*/*.js']).forEach(({name}) => {
  const scope = container.createScope();
  scope.loadModules([
    [`src/modules/${name.replace(/\.[a-z]+$/, '')}/*/*.js`, {register: asClass}]
  ], {
    formatName: 'camelCase',
    resolverOptions: {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.PROXY
    }
  });
});

async function initModule(name, mode) {
  const scope = container.createScope();
  scope.loadModules([
    [`src/modules/${name.replace(/\.[a-z]+$/, '')}/*/*.js`, {register: asClass}]
  ], {
    formatName: 'camelCase',
    resolverOptions: {
      lifetime: Lifetime.SCOPED,
      resolutionMode: InjectionMode.PROXY
    }
  });
  const module = scope.resolve(name.replace(/\.([a-z])/, (a) => a[1].toUpperCase()));

  if (typeof module.initModule === 'function') {
    logger.info(`Init ${name.replace(/\.[a-z]+$/, '')} module`);
    await module.initModule(mode);
  }

  return module;
}

module.exports = {
  initModule,
  container
};
