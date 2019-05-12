/* istanbul ignore file */
const Raven = require('raven');
const logger = require('log4js').getLogger('raven.helper');

class RavenHelper {

  /**
	 * @param {AppConfig} opts.config
	 */
  constructor(opts) {
    this.config = opts.config;
  }

  error(error, key, additionalData = null) {
    const extra = additionalData || {};
    extra.key = key;

    if (!this.config.raven.enabled) {
      logger.error(error, extra);
      return new Error(key);
    }

    if (error instanceof Error) {
      logger.error(error, extra);
      Raven.captureException(error, {extra});
    } else {
      if (typeof error === 'object') {
        error = JSON.stringify(error);
      }

      if (typeof error === 'string') {
        Raven.captureMessage(error, {extra}, (err, eventId) => {
          logger.error(error, extra, eventId);
        });
      } else {
        Raven.captureException(error, {extra});
      }
    }

    return new Error('Unknown error');
  }

  sendWarning(message, data) {
    logger.warn(message, data);

    if (!Raven || !this.config.raven.enabled) {
      return;
    }

    Raven.captureMessage(message, {
      level: 'warning',
      extra: {error: data}
    });
  }

  sendMessage(message, data) {
    if (!Raven || !this.config.raven.enabled) {
      return;
    }

    Raven.captureMessage(message, {
      level: 'info',
      extra: data
    });
  }

  init() {
    return Promise.resolve();
  }

}

module.exports = RavenHelper;
