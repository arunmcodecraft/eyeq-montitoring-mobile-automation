const path = require('path');
const stepLogger = require('../../utils/logger/stepLogger');
const dataReader = require('../../utils/helpers/dataReader.util');

function extractTagValues(pickle) {
  const tags = (pickle.tags || []).map((tag) => tag.name);
  const metadata = {};
  const mappedKeys = {
    DataSource: 'dataSource',
    DataFile: 'dataFile',
    DataPath: 'dataPath',
    DataKey: 'dataKey',
    Key: 'dataKey',
    Env: 'dataEnv',
    DataEnv: 'dataEnv',
    DataSelector: 'dataSelector',
  };

  tags.forEach((tagName) => {
    if (!tagName.startsWith('@')) {
      return;
    }

    const normalizedTag = tagName.slice(1);
    const colonIndex = normalizedTag.indexOf(':');

    if (colonIndex !== -1) {
      const rawKey = normalizedTag.slice(0, colonIndex);
      const mappedKey = mappedKeys[rawKey] || rawKey;
      const rawValue = normalizedTag.slice(colonIndex + 1).replace(/__/g, '.');
      metadata[mappedKey] = rawValue;
      return;
    }

    const separatorIndex = normalizedTag.indexOf('_');

    if (separatorIndex === -1) {
      return;
    }

    const key = normalizedTag.slice(0, separatorIndex);
    const value = normalizedTag.slice(separatorIndex + 1).replace(/__/g, '.');
    metadata[key] = value;
  });

  return metadata;
}

function buildCsvSelector(metadata) {
  if (metadata.dataSelector) {
    return metadata.dataSelector;
  }

  if (metadata.dataKey && metadata.dataEnv) {
    return `${metadata.dataKey}@${metadata.dataEnv}`;
  }

  if (metadata.dataKey) {
    return metadata.dataKey;
  }

  return null;
}

function loadScenarioData(metadata) {
  if (!metadata.dataFile) {
    return null;
  }

  if (!metadata.dataSource) {
    const normalizedFilePath = metadata.dataFile.toLowerCase();
    metadata.dataSource = normalizedFilePath.endsWith('.json') ? 'json' : 'csv';
  }

  if (metadata.dataSource === 'json') {
    return dataReader.readJsonDataSet(metadata.dataFile, metadata.dataPath);
  }

  if (metadata.dataSource === 'csv') {
    const selector = buildCsvSelector(metadata);

    if (!selector) {
      throw new Error('CSV scenario data requires @dataKey_<value> or @dataSelector_<value>.');
    }

    return dataReader.readCsvDataSet(metadata.dataFile, selector);
  }

  throw new Error(`Unsupported data source configured in tags: ${metadata.dataSource}`);
}

module.exports = {
  async beforeScenario(world) {
    stepLogger.log(`Scenario started: ${world.pickle.name}`);
    world.assert.clearSoftAssertions();
    world.dataConfig = extractTagValues(world.pickle);
    world.testData = loadScenarioData(world.dataConfig);

    if (world.testData) {
      stepLogger.log(`Scenario data loaded from ${world.dataConfig.dataSource}:${world.dataConfig.dataFile}`);
    }
  },

  async beforeStep(step) {
    stepLogger.log(`Step started: ${step.text}`);
  },

  async afterStep(step, _scenario, result) {
    const status = result?.passed ? 'PASSED' : 'FAILED';
    stepLogger.log(`Step finished: ${step.text} -> ${status}`);

    if (!result?.passed && typeof browser !== 'undefined') {
      const screenshotName = `${Date.now()}-${step.text.replace(/[^a-zA-Z0-9]+/g, '_')}.png`;
      const screenshotPath = path.resolve(process.cwd(), 'logs', screenshotName);
      await browser.saveScreenshot(screenshotPath);
      stepLogger.log(`Captured failure screenshot: ${screenshotPath}`);
    }
  },

  async afterScenario(world, result) {
    const status = result?.passed ? 'PASSED' : 'FAILED';
    stepLogger.log(`Scenario finished: ${world.pickle.name} -> ${status}`);
    let assertionError = null;

    if (result?.passed) {
      try {
        world.assert.assertAll();
      } catch (error) {
        assertionError = error;
      }
    }

    world.testData = null;
    world.dataConfig = null;
    world.assert.clearSoftAssertions();

    if (assertionError) {
      throw assertionError;
    }
  },
};
