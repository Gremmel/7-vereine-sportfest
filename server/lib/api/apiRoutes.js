import logger from '../logger.js';
import authMiddleware from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';

const apiRoutes = {
  init (app, config) {
    //todo Dummy-Datenbank für Benutzer (zum Beispiel)
    const users = [
      { id: 1, username: 'admin', password: '1234' } // Beispiel-Benutzer
    ];

    // API-Routen
    app.get('/api/protected', authMiddleware.check('testRolle').bind(authMiddleware), (req, res) => {
      res.json({ message: 'Hallo von der API protected!' });
    });

    app.get('/api/unprotected', (req, res) => {
      res.json({ message: 'Hallo von der API! unprotected' });
    });

    app.post('/api/login', (req, res) => {
      logger.fatal('/api/login req.body', req.body);
      const { username, password } = req.body;

      // Überprüfe Benutzername und Passwort
      const user = users.find((us) => us.username === username && us.password === password);

      if (user) {
        // Wenn der Benutzer existiert, erzeuge einen JWT
        const token = jwt.sign({ userId: user.id, username: user.username }, config.JWT.secret, { expiresIn: '1h' });

        // Setze das Token als HTTP-Only Cookie
        res.cookie('7vsf-session_token', token, {
          httpOnly: true, // Cookie nicht durch JavaScript im Browser zugreifbar
          // todo secure in der produktiv umgebung mit nginx auf true setzen
          secure: false, // Setze dies auf true, wenn du HTTPS verwendest
          maxAge: 3600000, // Cookie-Lebensdauer (z.B. 1 Stunde)
          sameSite: 'strict' // Schützt vor CSRF-Angriffen
        });

        // Erfolgsnachricht senden
        res.json({ message: 'Login erfolgreich!' });
      } else {
        // Falsche Zugangsdaten
        res.status(401).json({ message: 'Ungültiger Benutzername oder Passwort' });
      }
    });

    // Logout-Route (GET)
    app.get('/api/logout', (req, res) => {
      logger.info('/api/logout');
      res.clearCookie('7vsf-session_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });
      res.json({ message: 'Erfolgreich abgemeldet' });
    });
  }
};

export default apiRoutes;
