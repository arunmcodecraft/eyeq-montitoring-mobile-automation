const { defineParameterType } = require('@cucumber/cucumber');
const dataReader = require('../utils/helpers/dataReader.util');

function stripWrappingQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith('\'') && value.endsWith('\''))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

defineParameterType({
  name: 'platform',
  regexp: /android|ios/i,
  transformer(value) {
    return value.toLowerCase();
  },
});

defineParameterType({
  name: 'dataValue',
  regexp: /"[^"]*"|'[^']*'|td\.[^\s,]+|(?:json|csv):[^\s,]+|true|false|null|-?\d+(?:\.\d+)?|[^\s,]+/,
  transformer(rawValue) {
    const normalizedValue = stripWrappingQuotes(rawValue);

    if (normalizedValue.startsWith('td.')) {
      return {
        type: 'tdRef',
        path: normalizedValue.replace(/^td\./, ''),
      };
    }

    if (normalizedValue === 'true') {
      return true;
    }

    if (normalizedValue === 'false') {
      return false;
    }

    if (normalizedValue === 'null') {
      return null;
    }

    if (/^-?\d+(?:\.\d+)?$/.test(normalizedValue)) {
      return Number(normalizedValue);
    }

    if (normalizedValue.startsWith('json:')) {
      return dataReader.readJsonReference(normalizedValue);
    }

    if (normalizedValue.startsWith('csv:')) {
      return dataReader.readCsvReference(normalizedValue);
    }

    return normalizedValue;
  },
});

defineParameterType({
  name: 'jObj',
  regexp: /\{.*\}/,
  transformer(rawValue) {
    const normalizedValue = stripWrappingQuotes(rawValue).replace(/'/g, '"');
    return JSON.parse(normalizedValue);
  },
});

defineParameterType({
  name: 'list',
  regexp: /\[[^\]]*\]/,
  transformer(rawValue) {
    const normalizedValue = stripWrappingQuotes(rawValue);

    try {
      return JSON.parse(normalizedValue.replace(/'/g, '"'));
    } catch (error) {
      return normalizedValue
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  },
});
