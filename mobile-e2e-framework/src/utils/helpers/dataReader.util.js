const fs = require('fs');
const path = require('path');

const dataDirectory = path.resolve(__dirname, '../../data');
const projectRoot = path.resolve(__dirname, '../../..');
const cache = new Map();

function resolveDataFilePath(fileNameOrPath, extension) {
  const normalizedInput = fileNameOrPath.replace(/\\/g, path.sep);
  const hasExtension = path.extname(normalizedInput) !== '';
  const withExtension = hasExtension ? normalizedInput : `${normalizedInput}.${extension}`;

  const candidatePaths = [
    path.resolve(dataDirectory, withExtension),
    path.resolve(projectRoot, withExtension),
  ];

  const existingPath = candidatePaths.find((candidatePath) => fs.existsSync(candidatePath));

  if (!existingPath) {
    throw new Error(`Data file not found: ${fileNameOrPath}`);
  }

  return existingPath;
}

function getValueByPath(source, pathExpression) {
  if (!pathExpression) {
    return source;
  }

  return pathExpression.split('.').reduce((current, key) => {
    if (current === undefined || current === null) {
      return undefined;
    }

    return current[key];
  }, source);
}

function loadJsonFile(fileName) {
  const fullPath = resolveDataFilePath(fileName, 'json');
  const cacheKey = `json:${fullPath}`;

  if (!cache.has(cacheKey)) {
    const parsedContent = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    cache.set(cacheKey, parsedContent);
  }

  return cache.get(cacheKey);
}

function detectDelimiter(headerLine) {
  const pipeCount = (headerLine.match(/\|/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;

  return pipeCount > commaCount ? '|' : ',';
}

function parseDelimitedLine(line, delimiter) {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"') {
      if (insideQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (character === delimiter && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  values.push(current.trim());
  return values;
}

function coerceScalar(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === '') {
    return '';
  }

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  if (value === 'null') {
    return null;
  }

  if (/^-?\d+(?:\.\d+)?$/.test(value)) {
    return Number(value);
  }

  if (
    (value.startsWith('{') && value.endsWith('}'))
    || (value.startsWith('[') && value.endsWith(']'))
  ) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  }

  return value;
}

function loadCsvFile(fileName) {
  const fullPath = resolveDataFilePath(fileName, 'csv');
  const cacheKey = `csv:${fullPath}`;

  if (!cache.has(cacheKey)) {
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const lines = fileContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));

    if (lines.length === 0) {
      throw new Error(`CSV data file is empty: ${fileName}`);
    }

    const delimiter = detectDelimiter(lines[0]);
    const headers = parseDelimitedLine(lines[0], delimiter);
    const rows = lines.slice(1).map((line) => {
      const values = parseDelimitedLine(line, delimiter);
      const row = {};

      headers.forEach((header, index) => {
        row[header] = coerceScalar(values[index] || '');
      });

      return row;
    });

    cache.set(cacheKey, rows);
  }

  return cache.get(cacheKey);
}

function readJsonReference(reference) {
  const [, payload] = reference.split('json:');
  const [fileName, ...pathParts] = payload.split('.');
  const data = loadJsonFile(fileName);
  const value = getValueByPath(data, pathParts.join('.'));

  if (value === undefined) {
    throw new Error(`JSON reference not found: ${reference}`);
  }

  return value;
}

function parseRowSelector(rowSelector) {
  if (!rowSelector) {
    return null;
  }

  if (rowSelector.includes('=')) {
    return rowSelector.split(/[\|@]/).reduce((criteria, part) => {
      const [key, ...valueParts] = part.split('=');
      criteria[key] = valueParts.join('=');
      return criteria;
    }, {});
  }

  if (rowSelector.includes('@')) {
    const [key, env] = rowSelector.split('@');
    return {
      Key: key,
      Env: env,
    };
  }

  return null;
}

function matchesRowCriteria(row, criteria) {
  return Object.entries(criteria).every(([key, expectedValue]) => String(row[key]) === expectedValue);
}

function findCsvRow(rows, rowSelector) {
  const indexAsNumber = Number(rowSelector);

  if (!Number.isNaN(indexAsNumber) && rows[indexAsNumber]) {
    return rows[indexAsNumber];
  }

  const criteria = parseRowSelector(rowSelector);

  if (criteria) {
    return rows.find((row) => matchesRowCriteria(row, criteria));
  }

  return rows.find((row) => (
    String(row.id) === rowSelector
    || String(row.key) === rowSelector
    || String(row.name) === rowSelector
    || String(row.Key) === rowSelector
  ));
}

function readCsvReference(reference) {
  const [, payload] = reference.split('csv:');
  const [fileName, rowKey, ...fieldParts] = payload.split(':');
  const rows = loadCsvFile(fileName);

  if (!rowKey) {
    throw new Error(`CSV reference must include a row key or row index: ${reference}`);
  }

  const row = findCsvRow(rows, rowKey);

  if (!row) {
    throw new Error(`CSV row not found for reference: ${reference}`);
  }

  if (fieldParts.length === 0) {
    return row;
  }

  const value = getValueByPath(row, fieldParts.join('.'));

  if (value === undefined) {
    throw new Error(`CSV field not found for reference: ${reference}`);
  }

  return value;
}

function readJsonDataSet(fileName, pathExpression) {
  const data = loadJsonFile(fileName);

  if (!pathExpression) {
    return data;
  }

  const value = getValueByPath(data, pathExpression);

  if (value === undefined) {
    throw new Error(`JSON dataset path not found: ${fileName}.${pathExpression}`);
  }

  return value;
}

function readCsvDataSet(fileName, selector) {
  const rows = loadCsvFile(fileName);
  const row = findCsvRow(rows, selector);

  if (!row) {
    throw new Error(`CSV dataset row not found: ${fileName} -> ${selector}`);
  }

  return row;
}

module.exports = {
  readCsvDataSet,
  readJsonReference,
  readJsonDataSet,
  readCsvReference,
};
