import express from './lib/express.js'; // Express importieren
import { fileURLToPath } from 'url';
import logger from './lib/logger.js'; // Logger importieren
import fs from 'fs-extra';
import path from 'path';

// import socketIo from './lib/socketIo.js'; // Socket.IO importieren

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const extdir = path.join(dirname, '..', 'extern');

// eslint-disable-next-line no-sync
const config = fs.readJSONSync(path.join(extdir, 'config.json'));

logger.debug('init express');

// Webserver initialisieren
express.init(config);

// logger.debug('init socket IO');
// Socket.IO initialisieren
// socketIo.init(express.server);

// Signalbehandlung für SIGINT und SIGTERM
process.on('SIGINT', async () => {
  logger.debug('SIGINT (Ctrl+C)');
  process.exit();
});

process.on('SIGTERM', async () => {
  logger.debug('SIGTERM');
  process.exit();
});

process.on('exit', (code) => {
  logger.debug(`exit with code: ${code}`);
});

// Express-Server starten
express.start();
