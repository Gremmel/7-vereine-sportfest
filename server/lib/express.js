import express from 'express';
import { fileURLToPath } from 'url';
import http from 'http';
import logger from './logger.js';
import path from 'path';

// ESM braucht __dirname-Ersatz
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const expressApp = {
  app: express(),
  server: undefined,
  port: 3000,

  init (config) {
    logger.fatal(config);

    if (config?.express?.port) {
      this.port = config.express.port;
    }

    // Static Path für UI
    this.app.use('/', express.static(path.join(dirname, '..', '..', 'ui', 'dist')));

    this.server = http.createServer(this.app);
  },

  start () {
    this.server.listen(this.port, () => {
      logger.info('App listening on port', this.port);
    });
  }
};

export default expressApp;
