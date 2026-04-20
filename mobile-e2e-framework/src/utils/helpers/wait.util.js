module.exports = {
  async waitForExist(element, timeout = Number(process.env.DEFAULT_WAIT_TIMEOUT || 15000)) {
    await element.waitForExist({
      timeout,
      timeoutMsg: `Element did not exist within ${timeout} ms`,
    });
  },

  async waitForDisplayed(element, timeout = Number(process.env.DEFAULT_WAIT_TIMEOUT || 15000)) {
    await element.waitForDisplayed({
      timeout,
      timeoutMsg: `Element was not displayed within ${timeout} ms`,
    });
  },

  async waitForClickable(element, timeout = Number(process.env.DEFAULT_WAIT_TIMEOUT || 15000)) {
    await element.waitForClickable({
      timeout,
      timeoutMsg: `Element was not clickable within ${timeout} ms`,
    });
  },

  async waitForEnabled(element, timeout = Number(process.env.DEFAULT_WAIT_TIMEOUT || 15000)) {
    await browser.waitUntil(
      async () => element.isEnabled(),
      {
        timeout,
        timeoutMsg: `Element was not enabled within ${timeout} ms`,
      },
    );
  },

  async waitUntil(condition, options = {}) {
    const timeout = options.timeout || Number(process.env.DEFAULT_WAIT_TIMEOUT || 15000);
    await browser.waitUntil(condition, {
      timeout,
      timeoutMsg: options.timeoutMsg || `Condition was not met within ${timeout} ms`,
      interval: options.interval || 500,
    });
  },

  async pause(milliseconds) {
    await browser.pause(milliseconds);
  },
};
