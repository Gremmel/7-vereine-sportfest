import logger from '../logger.js';
import authMiddleware from '../middleware/authMiddleware.js';
import loginController from './loginController.js';
import sessionController from './sessionController.js';
import userController from './userController.js';
import sportlerController from './sportlerController.js';
import vereineController from './vereineController.js';
import sportfestController from './sportfestController.js';
import meldungController from './meldungController.js';
import staffelController from './staffelController.js';
import fileController from './fileController.js';
import multer from 'multer';

// Speicherort und Dateinamen für hochgeladene Dateien konfigurieren
const upload = multer({
  dest: `${process.cwd()}/../extern/uploads/`, // Ordner, in dem die Dateien gespeichert werden
  limits: { fileSize: 10 * 1024 * 1024 } // Maximalgröße der Datei (z. B. 10 MB)
});

const apiRoutes = {
  init (app, config) {
    sessionController.init(config);

    app.post('/api/upload', authMiddleware.check('admin'), upload.array('files', 10), async (req, res) => {
      const result = await fileController.handleMultipleFileUpload(req.files);

      if (result.success) {
        res.json({
          message: 'Dateien erfolgreich hochgeladen',
          files: result.files
        });
      } else {
        res.status(401).json({ message: result.message });
      }
    });

    app.get('/api/getFileList', authMiddleware.check('admin'), (req, res) => {
      const token = req.cookies.session_token;

      logger.info('/api/getFileList', token);

      const files = fileController.getFileList();

      if (token) {
        res.json({ files });
      } else {
        res.json({ message: 'Keine session vorhanden' });
      }
    });

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

    // Aktive Sportfeste abrufen
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

    // alle Sportfeste abrufen
    app.get('/api/getSportfestList', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/getSportfestList req.body', req.body);

      // Sportfeste abrufen
      const data = await sportfestController.getSportfestList();

      if (data) {
        // Erfolgsnachricht senden
        res.json(data);
      } else {
        res.status(401).json({ message: 'Fehler beim Sportfest abrufen' });
      }
    });

    // new Sportfest
    app.post('/api/newSportfest', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/newSportfest req.body', req.body);

      const io = sportfestController.newSportfest(req.body.sportfest);

      if (io.success) {
        // Erfolgsnachricht senden
        res.json({ sportfestId: io.sportfestId });
      } else {
        res.status(401).json({ message: 'Fehler bei newSportfest' });
      }
    });

    // edit Sportfest
    app.post('/api/editSportfest', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/editSportfest req.body', req.body);

      const io = await sportfestController.editSportfest(req.body.sportfest);

      if (io) {
        // Erfolgsnachricht senden
        res.json({ io });
      } else {
        res.status(401).json({ message: 'Fehler bei editSportfest' });
      }
    });

    // del Sportfest
    app.post('/api/delSportfest', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/delSportfest req.body', req.body);

      const io = sportfestController.delSportfest(req.body.delSportfestId);

      if (io) {
        // Erfolgsnachricht senden
        res.json({ io });
      } else {
        res.status(401).json({ message: 'Fehler bei delSportfest' });
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

    // Höhemeldung anlegen
    app.post('/api/hoeheMeldung', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/hoeheMeldung req.body', req.body);

      // Höhemeldung anlegen
      const io = await meldungController.hoeheMeldung(req.body);

      if (io) {
        // Erfolgsnachricht senden
        res.json({ io });
      } else {
        res.status(401).json({ message: 'Fehler beim ändern der Höhe' });
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

    // Staffel Übersicht abrufen
    app.post('/api/getStaffelUebersicht', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const klassen = staffelController.getKlassen(req.body);

        res.json({
          klassen
        });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // Staffel anlegen
    app.post('/api/newStaffel', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const staffelId = staffelController.newStaffel(req.body);

        res.json({ staffelId });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // Staffel anlegen
    app.post('/api/saveStaffelMeldungen', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const staffelMeldung = staffelController.saveStaffelMeldungen(req.body);

        res.json({ staffelMeldung });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // Staffel Übersicht abrufen
    app.post('/api/delStaffel', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const io = staffelController.delStaffel(req.body.delStaffelId);

        res.json({
          io
        });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // alle Sportler abrufen
    app.post('/api/getKlasseSportler', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const klasseSportler = await staffelController.getKlasseSportler(req.body);

        res.json({ klasseSportlerList: klasseSportler });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    // Staffel Übersicht abrufen
    app.get('/api/getStaffelUebersicht/:sportfestId', authMiddleware.check('admin'), async (req, res) => {
      try {
        const klassen = await staffelController.getKlassen(req.params.sportfestId);

        res.json({
          klassen
        });
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });
  }
};

export default apiRoutes;
