const path = require('path');
const { config: sharedConfig } = require('./wdio.shared.conf');
const iosCapabilities = require('./capabilities/ios.capabilities');

exports.config = {
  ...sharedConfig,
  specs: [path.resolve(__dirname, '../src/tests/features/**/*.feature')],
  capabilities: iosCapabilities,
};
