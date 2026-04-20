const waitUtil = require('../utils/helpers/wait.util');
const logger = require('../utils/logger/logger');

class BasePage {
  getElementLabel(selector, elementName) {
    return elementName || selector;
  }

  logAction(action, selector, elementName) {
    logger.info(`[BASE_PAGE] ${action}: ${this.getElementLabel(selector, elementName)}`);
  }

  logFailure(action, selector, elementName, error) {
    logger.error(
      `[BASE_PAGE] ${action} failed for ${this.getElementLabel(selector, elementName)}: ${error.message}`,
    );
  }

  async getElement(selector, elementName) {
    this.logAction('Locate element', selector, elementName);
    return $(selector);
  }

  async getElements(selector, elementName) {
    this.logAction('Locate elements', selector, elementName);
    return $$(selector);
  }

  async waitForExist(selector, timeout, elementName) {
    const element = await this.getElement(selector, elementName);
    this.logAction('Wait for exist', selector, elementName);
    await waitUtil.waitForExist(element, timeout);
    return element;
  }

  async waitForVisible(selector, timeout, elementName) {
    const element = await this.waitForExist(selector, timeout, elementName);
    this.logAction('Wait for visible', selector, elementName);
    await waitUtil.waitForDisplayed(element, timeout);
    return element;
  }

  async waitForClickable(selector, timeout, elementName) {
    const element = await this.waitForVisible(selector, timeout, elementName);
    this.logAction('Wait for clickable', selector, elementName);
    await waitUtil.waitForClickable(element, timeout);
    return element;
  }

  async waitForEnabled(selector, timeout, elementName) {
    const element = await this.waitForVisible(selector, timeout, elementName);
    this.logAction('Wait for enabled', selector, elementName);
    await waitUtil.waitForEnabled(element, timeout);
    return element;
  }

  async typeText(selector, value, elementName) {
    const element = await this.waitForVisible(selector, undefined, elementName);
    this.logAction('Clear text', selector, elementName);
    await element.clearValue();
    this.logAction('Type text', selector, elementName);
    await element.setValue(value);
  }

  async tap(selector, elementName) {
    const element = await this.waitForClickable(selector, undefined, elementName);
    this.logAction('Tap', selector, elementName);
    await element.click();
  }

  async getText(selector, elementName) {
    const element = await this.waitForVisible(selector, undefined, elementName);
    this.logAction('Read text', selector, elementName);
    return element.getText();
  }

  async getAttribute(selector, attributeName, elementName) {
    const element = await this.waitForExist(selector, undefined, elementName);
    this.logAction(`Read attribute ${attributeName}`, selector, elementName);
    return element.getAttribute(attributeName);
  }

  async clearText(selector, elementName) {
    const element = await this.waitForVisible(selector, undefined, elementName);
    this.logAction('Clear text', selector, elementName);
    await element.clearValue();
  }

  async isVisible(selector, timeout, elementName) {
    try {
      const element = await this.waitForVisible(selector, timeout, elementName);
      return element.isDisplayed();
    } catch (error) {
      this.logFailure('Check visible', selector, elementName, error);
      return false;
    }
  }

  async isExisting(selector, timeout, elementName) {
    try {
      const element = await this.waitForExist(selector, timeout, elementName);
      return element.isExisting();
    } catch (error) {
      this.logFailure('Check exist', selector, elementName, error);
      return false;
    }
  }

  async pause(milliseconds) {
    logger.info(`[BASE_PAGE] Pause execution for ${milliseconds} ms`);
    await waitUtil.pause(milliseconds);
  }

  async waitUntil(condition, options) {
    logger.info('[BASE_PAGE] Wait until custom condition is met');
    await waitUtil.waitUntil(condition, options);
  }

  async hideKeyboard() {
    logger.info('[BASE_PAGE] Hide keyboard');
    if (driver.isKeyboardShown && await driver.isKeyboardShown()) {
      await driver.hideKeyboard();
    }
  }
}

module.exports = BasePage;
