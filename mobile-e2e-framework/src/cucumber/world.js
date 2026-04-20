const { setWorldConstructor, World } = require('@cucumber/cucumber');
const AssertUtil = require('../utils/assertions/assert.util');

class CustomWorld extends World {
  constructor(options) {
    super(options);
    this.context = {};
    this.testData = null;
    this.dataConfig = null;
    this.softFailures = [];
    this.assert = new AssertUtil(this);
  }
}

setWorldConstructor(CustomWorld);
