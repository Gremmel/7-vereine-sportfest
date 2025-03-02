/* eslint-disable callback-return */
import sessionController from '../api/sessionController.js';
import logger from '../logger.js';
import jwt from 'jsonwebtoken';

class AuthMiddleware {
  constructor () {
    this.secret = null;
  }

  setSecret (secret) {
    this.secret = secret;
  }

  // Dummy-Funktion zur Überprüfung des Tokens (Anpassbar)
  verifyToken (token) {
    try {
      logger.info('verifyToken', this.secret);

      // Überprüfe den Token und dekodiere die Payload
      const decoded = jwt.verify(token, this.secret);

      logger.warn('tocken  decoded', decoded);

      return decoded; // Gibt die dekodierte Payload zurück, wenn der Token gültig ist
    } catch (err) {
      logger.error('Token ungültig oder abgelaufen', err);

      // Wenn der Token ungültig oder abgelaufen ist, gebe false zurück oder werfe einen Fehler
      return false; // Hier kannst du auch Fehlerbehandlung einfügen, wenn gewünscht
    }
  }

  // Authentifizierungs-Middleware
  check (requiredRole) {
    return (req, res, next) => {
      const token = req.cookies.session_token;

      if (token) {
        const decoded = this.verifyToken(token);

        if (decoded) {
          // Rolle des Benutzers überprüfen
          if (requiredRole && !decoded.user.roles.includes(requiredRole)) {
            return res.status(403).json({ message: 'Zugriff verweigert: Unzureichende Berechtigungen' });
          }

          // token verlängern
          const newToken = sessionController.extendToken(token);

          // cookie neu mit verlängertem token neu setzen
          logger.info('session verlägern', newToken);
          res.cookie('session_token', newToken, {
            httpOnly: true, // Cookie nicht durch JavaScript im Browser zugreifbar
            secure: true, // true = wenn HTTPS
            maxAge: 3600000, // Cookie-Lebensdauer (z.B. 1 Stunde)
            sameSite: 'strict' // Schützt vor CSRF-Angriffen
          });

          // Wenn alles passt, rufe next() auf
          next();
        } else {
          res.status(401).json({
            message: 'session ist abgelaufen',
            token: false
          });
        }
      } else {
        res.status(401).json({
          message: 'keine session vorhanden',
          token: false
        });
      }
    };
  }
}

export default new AuthMiddleware();
