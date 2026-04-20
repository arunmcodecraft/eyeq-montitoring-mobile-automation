const util = require('util');
const logger = require('../logger/logger');

function formatValue(value) {
  return util.inspect(value, {
    depth: 5,
    breakLength: Infinity,
    compact: true,
  });
}

function buildMessage(defaultMessage, customMessage) {
  return customMessage || defaultMessage;
}

function createAssertionError(message, actual, expected) {
  const error = new Error(message);
  error.name = 'AssertionError';
  error.actual = actual;
  error.expected = expected;
  return error;
}

class AssertUtil {
  constructor(world) {
    this.world = world;
  }

  get softFailures() {
    if (!this.world.softFailures) {
      this.world.softFailures = [];
    }

    return this.world.softFailures;
  }

  logPass(assertionType, message) {
    logger.info(`[ASSERT][${assertionType}][PASS] ${message}`);
  }

  logFail(assertionType, message) {
    logger.error(`[ASSERT][${assertionType}][FAIL] ${message}`);
  }

  handleResult({ passed, assertionType, message, actual, expected, soft }) {
    if (passed) {
      this.logPass(assertionType, message);
      return true;
    }

    const error = createAssertionError(message, actual, expected);
    this.logFail(assertionType, `${message} | actual=${formatValue(actual)} expected=${formatValue(expected)}`);

    if (soft) {
      this.softFailures.push(error);
      return false;
    }

    throw error;
  }

  equal(actual, expected, customMessage, options = {}) {
    const passed = actual === expected;
    const message = buildMessage(
      `Expected ${formatValue(actual)} to equal ${formatValue(expected)}`,
      customMessage,
    );

    return this.handleResult({
      passed,
      assertionType: options.soft ? 'SOFT_EQUAL' : 'HARD_EQUAL',
      message,
      actual,
      expected,
      soft: options.soft,
    });
  }

  true(value, customMessage, options = {}) {
    const passed = Boolean(value) === true;
    const message = buildMessage(
      `Expected value to be truthy but received ${formatValue(value)}`,
      customMessage,
    );

    return this.handleResult({
      passed,
      assertionType: options.soft ? 'SOFT_TRUE' : 'HARD_TRUE',
      message,
      actual: value,
      expected: true,
      soft: options.soft,
    });
  }

  contains(container, expectedValue, customMessage, options = {}) {
    const passed = typeof container === 'string'
      ? container.includes(expectedValue)
      : Array.isArray(container)
        ? container.includes(expectedValue)
        : false;

    const message = buildMessage(
      `Expected ${formatValue(container)} to contain ${formatValue(expectedValue)}`,
      customMessage,
    );

    return this.handleResult({
      passed,
      assertionType: options.soft ? 'SOFT_CONTAINS' : 'HARD_CONTAINS',
      message,
      actual: container,
      expected: expectedValue,
      soft: options.soft,
    });
  }

  hardEqual(actual, expected, customMessage) {
    return this.equal(actual, expected, customMessage, { soft: false });
  }

  softEqual(actual, expected, customMessage) {
    return this.equal(actual, expected, customMessage, { soft: true });
  }

  hardTrue(value, customMessage) {
    return this.true(value, customMessage, { soft: false });
  }

  softTrue(value, customMessage) {
    return this.true(value, customMessage, { soft: true });
  }

  hardContains(container, expectedValue, customMessage) {
    return this.contains(container, expectedValue, customMessage, { soft: false });
  }

  softContains(container, expectedValue, customMessage) {
    return this.contains(container, expectedValue, customMessage, { soft: true });
  }

  assertAll() {
    if (!this.softFailures.length) {
      this.logPass('SOFT_ASSERT_ALL', 'No soft assertion failures recorded');
      return;
    }

    const combinedMessage = this.softFailures
      .map((error, index) => `${index + 1}. ${error.message}`)
      .join('\n');

    this.logFail('SOFT_ASSERT_ALL', `Soft assertion summary:\n${combinedMessage}`);
    throw new Error(`Soft assertion failures detected:\n${combinedMessage}`);
  }

  clearSoftAssertions() {
    this.world.softFailures = [];
  }
}

module.exports = AssertUtil;
