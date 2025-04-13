import jwt from 'jsonwebtoken';
import logger from '../logger.js';

const sessionController = {
  sessions: [],
  config: null,

  init (config) {
    this.config = config;
  },

  extendToken (oldToken) {
    try {
      // Verifiziere das alte Token
      const decoded = jwt.verify(oldToken, this.config.JWT.secret);

      // Entferne sensible Felder wie `iat` und `exp` aus dem alten Token
      // eslint-disable-next-line no-unused-vars
      const { iat, exp, ...rest } = decoded;

      // Erstelle ein neues Token mit einer neuen Ablaufzeit
      const newToken = jwt.sign(rest, this.config.JWT.secret, { expiresIn: '1h' });

      // token in session austauschen
      for (const session of this.sessions) {
        if (session.token === oldToken) {
          // logger.info('tausche token in session weil verlängert');
          session.token = newToken;
        }
      }

      // logger.fatal('extendToken', this.sessions);

      return newToken;
    } catch (error) {
      logger.error('Fehler beim Verlängern des Tokens:', error);

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

    // logger.warn('add session', this.sessions);

    return token;
  },

  removeSession (token) {
    const index = this.sessions.findIndex((session) => session.token === token);

    if (index !== -1) {
      this.sessions.splice(index, 1);
    }
  },

  getSessionByToken (token) {
    logger.fatal('getSessionByToken', this.sessions);
    for (const session of this.sessions) {
      logger.warn(session.token);
      logger.debug(token);
      if (session.token === token) {
        return session;
      }
    }

    logger.warn('no getSesstionByToken found');

    return null;
  }
};

export default sessionController;
