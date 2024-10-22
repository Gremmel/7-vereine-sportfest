import express from 'express';
import { fileURLToPath } from 'url';
import http from 'http';
import logger from './logger.js';
import path from 'path';
import cookieParser from 'cookie-parser'; // Für das Cookie-Parsing
import jwt from 'jsonwebtoken';
import cors from 'cors'; // Importiere CORS brauchen wir das wir die routen vom devserver aus aufrufen können

// ESM braucht __dirname-Ersatz
const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const expressApp = {
  app: express(),
  server: undefined,
  port: 3000,

  // Dummy-Funktion zur Überprüfung des Tokens (Anpassbar)
  verifyToken (token) {
    // Beispiel: Überprüfe den Token (z.B. JWT oder Session in Datenbank)
    if (token === 'valid-token') {
      return true; // Token ist gültig
    }

    return false; // Token ist ungültig
  },

  // Authentifizierungs-Middleware
  authMiddleware (req, res, next) {
    const token = req.cookies.session_token; // Hole das Session-Token aus dem Cookie

    if (token && this.verifyToken(token)) {
      // eslint-disable-next-line callback-return
      next(); // Wenn der Token gültig ist, rufe next() auf
    } else {
      res.status(401).json({ message: 'Nicht autorisiert' }); // 401: Nicht autorisiert
    }
  },

  init (config) {
    logger.fatal(config);

    // Verwende CORS für alle Routen
    this.app.use(cors({
      origin: '*',
      methods: [ 'GET', 'POST' ],
      // origin: 'http://192.168.201.42:5173/', // Ersetze dies mit der URL deines Vue-Entwicklungsservers
      credentials: true // Wenn du Cookies oder Anmeldeinformationen sendest
    }));

    // 1 steht für "einen Proxy" wie Nginx
    // Dies teilt Express mit, dass es den X-Forwarded-*-Headern, die vom Proxy gesendet werden
    // (wie X-Forwarded-Proto für das Protokoll), vertrauen soll. Dadurch wird Express bewusst,
    // dass die ursprüngliche Verbindung tatsächlich über HTTPS war, und es erlaubt das Setzen von Cookies mit dem secure-Flag.
    this.app.set('trust proxy', 1);

    // Middleware zum Parsen von Cookies
    this.app.use(express.json());
    this.app.use(cookieParser());

    // Geheimschlüssel zum Signieren des JWT
    const JWT_SECRET = 'geheimer_schluessel'; // Diesen solltest du sicher aufbewahren

    // Dummy-Datenbank für Benutzer (zum Beispiel)
    const users = [
      { id: 1, username: 'admin', password: '1234' } // Beispiel-Benutzer
    ];

    // API-Routen
    this.app.get('/api/protected', this.authMiddleware, (req, res) => {
      res.json({ message: 'Hallo von der API protected!' });
    });

    this.app.get('/api/unprotected', (req, res) => {
      res.json({ message: 'Hallo von der API! unprotected' });
    });

    this.app.post('/api/login', (req, res) => {
      logger.fatal('/api/login req.body', req.body);
      const { username, password } = req.body;

      // Überprüfe Benutzername und Passwort
      const user = users.find((us) => us.username === username && us.password === password);

      if (user) {
        // Wenn der Benutzer existiert, erzeuge einen JWT
        const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        // Setze das Token als HTTP-Only Cookie
        res.cookie('session_token', token, {
          httpOnly: true, // Cookie nicht durch JavaScript im Browser zugreifbar
          //todo secure in der produktiv umgebung mit nginx auf true setzen
          secure: false, // Setze dies auf true, wenn du HTTPS verwendest
          maxAge: 3600000 // Cookie-Lebensdauer (z.B. 1 Stunde)
          //sameSite: 'strict' // Schützt vor CSRF-Angriffen
        });

        // Erfolgsnachricht senden
        res.json({ message: 'Login erfolgreich!' });
      } else {
        // Falsche Zugangsdaten
        res.status(401).json({ message: 'Ungültiger Benutzername oder Passwort' });
      }
    });

    // Logout-Route (GET)
    this.app.get('/api/logout', (req, res) => {
      res.clearCookie('session_token', { httpOnly: true, secure: true, sameSite: 'strict' });
      res.json({ message: 'Erfolgreich abgemeldet' });
    });

    // Vue ausliefern
    this.app.use(express.static(path.join(dirname, '..', '..', 'ui', 'dist')));

    // Alle anderen Routen zur Vue-App leiten
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(path.join(dirname, '..', '..', 'ui', 'dist', 'index.html')));
    });

    // Static Path für UI
    // this.app.use('/', express.static(path.join(dirname, '..', '..', 'ui', 'dist')));

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
