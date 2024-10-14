import express from 'express';
import { fileURLToPath } from 'url';
import http from 'http';
import logger from './logger.js';
import path from 'path';

// ESM braucht __dirname-Ersatz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const expressApp = {
  app: express(),
  server: undefined,
  port: 3000,

  init () {
    // Static Path für UI
    this.app.use('/', express.static(path.join(__dirname, '..', '..', 'ui', 'dist')));

    this.server = http.createServer(this.app);
  },

  start () {
    this.server.listen(this.port, () => {
      logger.info('App listening on port', this.port);
    });
  }
};

export default expressApp;
