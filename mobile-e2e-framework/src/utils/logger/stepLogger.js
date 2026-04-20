const logger = require('./logger');

module.exports = {
  log(message) {
    logger.info(`[STEP] ${message}`);
  },
};
