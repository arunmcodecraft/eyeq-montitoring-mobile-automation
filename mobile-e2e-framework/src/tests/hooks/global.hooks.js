const logger = require('../../utils/logger/logger');

module.exports = {
  beforeSession(config, capabilities) {
    logger.info(`Starting session for ${capabilities.platformName}`);
    logger.debug(`Execution tags: ${config.cucumberOpts.tagExpression || 'none'}`);
  },

  async before() {
    logger.info('Driver session created');
  },

  async after(result, capabilities) {
    logger.info(`Driver session finished for ${capabilities.platformName}`);
    logger.debug(`Session result: ${JSON.stringify(result || {})}`);
  },

  onComplete(exitCode) {
    logger.info(`Execution completed with exit code ${exitCode}`);
  },
};
