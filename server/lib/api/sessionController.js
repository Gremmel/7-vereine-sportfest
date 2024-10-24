import jwt from 'jsonwebtoken';
import logger from '../logger.js';

const sessionController = {
  sessions: [],
  config: null,

  init (config) {
    this.config = config;
  },

  extendToken (oldToken, secretKey) {
    try {
      // Verifiziere das alte Token
      const decoded = jwt.verify(oldToken, secretKey);

      // Entferne sensible Felder wie `iat` und `exp` aus dem alten Token
      const { iat, exp, ...rest } = decoded;

      // Erstelle ein neues Token mit einer neuen Ablaufzeit
      const newToken = jwt.sign(rest, secretKey, { expiresIn: '1h' });  // Gültigkeit: 1 Stunde

      return newToken;
    } catch (error) {
      console.error('Fehler beim Verlängern des Tokens:', error);
      return null;
    }
  },

  addSession (user) {
    const token = jwt.sign({ user }, this.config.JWT.secret, { expiresIn: '1h' });

    const session = {
      token,
      user
    };

    this.sessions.push(session);

    logger.warn('add session', this.sessions);

    return token;
  },

  getSessionByToken (token) {
    logger.fatal('getSessionByToken', this.sessions);
    for (const session of this.sessions) {
      logger.warn(session.token);
      if (session.token === token) {
        return session;
      }
    }

    return null;
  }
};

export default sessionController;
