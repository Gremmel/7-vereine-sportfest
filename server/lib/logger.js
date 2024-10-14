import { fileURLToPath } from 'url';
import log4js from 'log4js';
import path from 'path';
import stringify from 'json-stringify-safe';

// Filename für das Log
const logfilename = 'server.log';

// ESM braucht __dirname-Ersatz
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// JSON-Layout hinzufügen
log4js.addLayout('json', (config) => function (logEvent) {
  return stringify({
    startTime: logEvent.startTime,
    categoryName: logEvent.categoryName,
    data: logEvent.data,
    level: logEvent.level.levelStr,
    functionName: logEvent.functionName,
    fileName: logEvent.fileName + ':' + logEvent.lineNumber,
    lineNumber: logEvent.lineNumber
  }) + config.separator;
});

// Logger konfigurieren
log4js.configure({
  appenders: {
    file: {
      type: 'file',
      filename: path.join(dirname, 'log', logfilename), // Pfad zum Logfile
      maxLogSize: 3 * 1024 * 1024, // 3 MB
      backups: 3,
      layout: {
        type: 'json',
        separator: ','
      }
    },
    out: {
      type: 'stdout',
      layout: {
        type: 'pattern',
        pattern: '%[%p%] %d{hh:mm:ss,SSS} %[%m%] %f:%l'
      }
    }
  },
  categories: {
    default: {
      appenders: [ 'file', 'out' ],
      level: 'debug',
      enableCallStack: true
    }
  }
});

// Logger erstellen
const logger = log4js.getLogger();

export default logger;
