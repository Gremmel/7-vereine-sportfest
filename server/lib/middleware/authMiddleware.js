/* eslint-disable callback-return */
import logger from '../logger.js';
import jwt from 'jsonwebtoken';

const authMiddleware = {
  secret: null,

  setSecret (secret) {
    this.secret = secret;
  },

  // Dummy-Funktion zur Überprüfung des Tokens (Anpassbar)
  verifyToken (token, secret) {
    try {
      logger.info('verifyToken', secret);

      // Überprüfe den Token und dekodiere die Payload
      const decoded = jwt.verify(token, secret);

      logger.warn('tocken  decoded', decoded);

      return decoded; // Gibt die dekodierte Payload zurück, wenn der Token gültig ist
    } catch (err) {
      logger.error('Token ungültig oder abgelaufen', err);

      // Wenn der Token ungültig oder abgelaufen ist, gebe false zurück oder werfe einen Fehler
      return false; // Hier kannst du auch Fehlerbehandlung einfügen, wenn gewünscht
    }
  },

  // Authentifizierungs-Middleware
  check (requiredRole) {
    return (req, res, next) => {
      const token = req.cookies.session_token;

      if (token) {
        const decoded = this.verifyToken(token, this.secret);

        if (decoded) {
          // Hier kannst du die Rolle des Benutzers überprüfen
          if (requiredRole && decoded.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Zugriff verweigert: Unzureichende Berechtigungen' });
          }

          // Wenn alles passt, rufe next() auf
          next();
        } else {
          res.status(401).json({ message: 'Nicht autorisiert' });
        }
      } else {
        res.status(401).json({ message: 'Kein Token vorhanden' });
      }
    };
  }
};

export default authMiddleware;
