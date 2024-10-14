import express from './lib/express.js'; // Express importieren
import logger from './lib/logger.js'; // Logger importieren
import path from 'path';
import socketIo from './lib/socketIo.js'; // Socket.IO importieren

// Globales externes Verzeichnis festlegen
global.__extdir = path.join('..', 'extern');

logger.debug('init express');

// Webserver initialisieren
express.init();

logger.debug('init socket IO');

// Socket.IO initialisieren
socketIo.init(express.server);

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
