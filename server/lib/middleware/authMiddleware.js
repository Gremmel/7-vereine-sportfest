import logger from '../logger.js';
import jwt from 'jsonwebtoken';

const authMiddleware = {
  secret: null,

  // Dummy-Funktion zur Überprüfung des Tokens (Anpassbar)
  verifyToken (token, secret) {
    try {
      logger.info('verifyToken', secret);
      // Überprüfe den Token und dekodiere die Payload
      const decoded = jwt.verify(token, secret);

      logger.warn('tocken  decoded', decoded);

      return decoded; // Gibt die dekodierte Payload zurück, wenn der Token gültig ist
    } catch (err) {
      // Wenn der Token ungültig oder abgelaufen ist, gebe false zurück oder werfe einen Fehler
      return false; // Hier kannst du auch Fehlerbehandlung einfügen, wenn gewünscht
    }
  },

  // Authentifizierungs-Middleware
  check (req, res, next) {
    const token = req.cookies.session_token; // Hole das Session-Token aus dem Cookie

    if (token && this.verifyToken(token, this.secret)) {
      // eslint-disable-next-line callback-return
      next(); // Wenn der Token gültig ist, rufe next() auf
    } else {
      res.status(401).json({ message: 'Nicht autorisiert' }); // 401: Nicht autorisiert
    }
  }
};

export default authMiddleware;
