const path = require('path');
const { config: sharedConfig } = require('./wdio.shared.conf');
const androidCapabilities = require('./capabilities/android.capabilities');

exports.config = {
  ...sharedConfig,
  specs: [path.resolve(__dirname, '../src/tests/features/**/*.feature')],
  capabilities: androidCapabilities,
};
