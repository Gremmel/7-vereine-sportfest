import express from 'express';
import { fileURLToPath } from 'url';
import http from 'http';
import logger from './logger.js';
import path from 'path';
import cookieParser from 'cookie-parser'; // Für das Cookie-Parsing
import cors from 'cors'; // Importiere CORS brauchen wir das wir die routen vom devserver aus aufrufen können
import apiRoutes from './api/apiRoutes.js';
import authMiddleware from './middleware/authMiddleware.js';

// ESM braucht __dirname-Ersatz
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const expressApp = {
  app: express(),
  server: undefined,
  port: 3000,

  init (config) {
    // logger.fatal(config);
    authMiddleware.setSecret(config.JWT.secret);

    // Verwende CORS für alle Routen
    this.app.use(cors({
      origin: [ 'http://localhost:5173', 'http://192.168.201.42:5173' ],
      methods: [ 'GET', 'POST' ],
      credentials: true // Wenn du Cookies oder Anmeldeinformationen sendest
    }));

    // 1 steht für "einen Proxy" wie Nginx
    // Dies teilt Express mit, dass es den X-Forwarded-*-Headern, die vom Proxy gesendet werden
    // (wie X-Forwarded-Proto für das Protokoll), vertrauen soll. Dadurch wird Express bewusst,
    // dass die ursprüngliche Verbindung tatsächlich über HTTPS war, und es erlaubt das Setzen von Cookies mit dem secure-Flag.
    // this.app.set('trust proxy', 1);

    // Middleware zum Parsen von Cookies
    this.app.use(express.json());
    this.app.use(cookieParser());

    apiRoutes.init(this.app, config);

    // Vue ausliefern
    this.app.use(express.static(path.join(dirname, '..', '..', 'ui', 'dist')));

    // Alle anderen Routen zur Vue-App leiten
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(path.join(dirname, '..', '..', 'ui', 'dist', 'index.html')));
    });

    if (config?.express?.port) {
      this.port = config.express.port;
    }

    this.server = http.createServer(this.app);
  },

  start () {
    this.server.listen(this.port, () => {
      logger.info('App listening on port', this.port);
    });
  }
};

export default expressApp;
