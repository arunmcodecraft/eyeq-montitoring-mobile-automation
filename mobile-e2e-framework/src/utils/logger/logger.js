const fs = require('fs');
const path = require('path');

const logsDir = path.resolve(process.cwd(), 'logs');
const logFilePath = path.resolve(logsDir, 'framework.log');

function ensureLogFile() {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '', 'utf-8');
  }
}

function write(level, message) {
  ensureLogFile();
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level}] ${message}`;
  fs.appendFileSync(logFilePath, `${line}\n`, 'utf-8');
  console.log(line);
}

module.exports = {
  info(message) {
    write('INFO', message);
  },

  debug(message) {
    write('DEBUG', message);
  },

  error(message) {
    write('ERROR', message);
  },
};
