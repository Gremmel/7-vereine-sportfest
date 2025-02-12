import logger from '../logger.js';
import authMiddleware from '../middleware/authMiddleware.js';
import loginController from './loginController.js';
import sessionController from './sessionController.js';
import userController from './userController.js';
import sportlerController from './sportlerController.js';
import vereineController from './vereineController.js';
import sportfestController from './sportfestController.js';
import meldungController from './meldungController.js';

const apiRoutes = {
  init (app, config) {
    sessionController.init(config);

    // API-Routen
    app.post('/api/login', async (req, res) => {
      logger.fatal('/api/login req.body', req.body);
      const { username, password } = req.body;

      // Überprüfe Benutzername und Passwort
      const user = await loginController.loginUser(username, password);

      logger.fatal('api login user', user);

      if (user) {
        // session erzeugen
        const token = sessionController.addSession(user);

        // Setze das Token als HTTP-Only Cookie
        res.cookie('session_token', token, {
          httpOnly: true, // Cookie nicht durch JavaScript im Browser zugreifbar
          // todo secure in der produktiv umgebung mit nginx auf true setzen
          secure: true, // Setze dies auf true, wenn du HTTPS verwendest
          maxAge: 3600000, // Cookie-Lebensdauer (z.B. 1 Stunde)
          sameSite: 'strict' // Schützt vor CSRF-Angriffen
        });

        // Erfolgsnachricht senden
        res.json({ user });
      } else {
        // Falsche Zugangsdaten
        res.status(401).json({ message: 'Ungültiger Benutzername oder Passwort' });
      }
    });

    // Logout-Route (GET)
    app.get('/api/logout', (req, res) => {
      logger.info('/api/logout');
      const token = req.cookies.session_token;

      sessionController.removeSession(token);

      res.clearCookie('session_token', {
        httpOnly: true,
        secure: false,
        sameSite: 'strict'
      });
      res.json({ message: 'Erfolgreich abgemeldet' });
    });

    // Logout-Route (GET)
    app.get('/api/getSession', (req, res) => {
      const token = req.cookies.session_token;

      logger.info('/api/getSession', token);

      if (token) {
        const session = sessionController.getSessionByToken(token);

        res.json({ user: session?.user });
      } else {
        res.json({ message: 'Keine session vorhanden' });
      }
    });

    // gibt die Benutzerliste zurück
    app.get('/api/getUserList', authMiddleware.check('admin'), (req, res) => {
      const token = req.cookies.session_token;

      logger.info('/api/getUserList', token);

      const users = userController.getUsers();

      if (token) {
        res.json({ users });
      } else {
        res.json({ message: 'Keine session vorhanden' });
      }
    });

    // legt einen neuen User an
    app.post('/api/adduser', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/adduser req.body', req.body);

      // Neuen Benutzer anlegen
      const newUser = await userController.addUser(req.body);

      if (newUser) {
        // Erfolgsnachricht senden
        res.json({ newUser });
      } else {
        res.status(401).json({ message: 'Fehler beim anlegen des neuen Users' });
      }
    });

    // Benutzer ändern
    app.post('/api/updateUser', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/updateUser req.body', req.body);

      // Benutzer ändern
      const result = await userController.updateUser(req.body);

      if (result) {
        // Erfolgsnachricht senden
        res.json({ result });
      } else {
        res.status(401).json({ message: 'Fehler beim ändern des Users' });
      }
    });

    // löscht einen User
    app.post('/api/deluser', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/deluser req.body', req.body);

      // Benutzer löschen
      const delUser = await userController.delUser(req.body);

      if (delUser) {
        // Erfolgsnachricht senden
        res.json({ delUser: true });
      } else {
        // Fehler beim löschen
        res.status(401).json({ message: 'Fehler beim löschen des Users' });
      }
    });

    // Sportler des Vereins abrufen anhand der ID
    app.get('/api/getSportlerList/:vereinsID', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const sportler = await sportlerController.getSportlerByVereinsID(req.params.vereinsID);

        res.json({ sportlerList: sportler });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // alle Sportler abrufen
    app.get('/api/getSportlerList', authMiddleware.check('admin'), async (req, res) => {
      try {
        const sportler = await sportlerController.getAllSportler();

        res.json({ sportlerList: sportler });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // alle Sportler abrufen die zu diesem Sportfest gehören
    app.post('/api/getFestSportlerList', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const sportlerList = await sportlerController.getFestSportlerList(req.body);

        res.json({ sportlerList });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // alle Vereine abrufen
    app.get('/api/getVereineList', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const vereineList = await vereineController.getVereine();

        res.json({ vereineList });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // Sportler anlegen
    app.post('/api/newsportler', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/newsprtler req.body', req.body);

      // Neuen Sportler anlegen
      const sportlerId = await sportlerController.newSportler(req.body);

      if (sportlerId) {
        // Erfolgsnachricht senden
        res.json({ sportlerId });
      } else {
        res.status(401).json({ message: 'Fehler beim anlegen des neuen Users' });
      }
    });

    // Sportler aendern
    app.post('/api/editsportler', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/editsportler req.body', req.body);

      // Sportler aendern
      const io = await sportlerController.editSportler(req.body);

      if (io) {
        // Erfolgsnachricht senden
        res.json({ io });
      } else {
        res.status(401).json({ message: 'Fehler beim Sportler ändern' });
      }
    });

    // Sportler löschen
    app.post('/api/delSportler', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/delSportler req.body', req.body);

      // Sportler aendern
      const io = await sportlerController.delSportler(req.body.delSportlerId);

      if (io) {
        // Erfolgsnachricht senden
        res.json({ io });
      } else {
        res.status(401).json({ message: 'Fehler beim löschen des Sportlers' });
      }
    });

    // Sportfeste abrufen
    app.post('/api/getAktiveSportfeste', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/getAktiveSportfeste req.body', req.body);

      // Sportfeste abrufen
      const sportfestList = await sportfestController.getAktiveSportfeste(req.body.user);

      if (sportfestList) {
        // Erfolgsnachricht senden
        res.json({ sportfestList });
      } else {
        res.status(401).json({ message: 'Fehler beim Sportfest abrufen' });
      }
    });


    // Meldung anlegen
    app.post('/api/newMeldung', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/newMeldung req.body', req.body);

      // Neue Meldung anlegen
      const meldungId = await meldungController.newMeldung(req.body);

      if (meldungId) {
        // Erfolgsnachricht senden
        res.json({ meldungId });
      } else {
        res.status(401).json({ message: 'Fehler beim anlegen der Meldung' });
      }
    });

    // Meldung löschen
    app.post('/api/delMeldung', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/delMeldung req.body', req.body);

      const io = await meldungController.delMeldung(req.body.meldungId);

      if (io) {
        // Erfolgsnachricht senden
        res.json({ io });
      } else {
        res.status(401).json({ message: 'Fehler beim löschen der Meldung' });
      }
    });
  }
};

export default apiRoutes;
