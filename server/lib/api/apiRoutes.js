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
import mime from 'mime-types';

// Speicherort und Dateinamen für hochgeladene Dateien konfigurieren
const upload = multer({
  dest: `${process.cwd()}/../extern/uploads/`, // Ordner, in dem die Dateien gespeichert werden
  limits: { fileSize: 10 * 1024 * 1024 } // Maximalgröße der Datei (z. B. 10 MB)
});

const apiRoutes = {
  init (app, config) {
    sessionController.init(config);

    app.get('/api/getDataHome', (req, res) => {
      logger.info('/api/getDataHome');

      const data = {
        sportfestList: sportfestController.getSportfestListHome(),
        fileList: fileController.getFileListHome()
      };

      if (data) {
        res.json(data);
      } else {
        res.json({ message: 'Keine session vorhanden' });
      }
    });

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
      logger.info('/api/getFileList');

      const fileList = fileController.getFileList();

      if (fileList) {
        res.json({ fileList });
      } else {
        res.json({ message: 'Keine session vorhanden' });
      }
    });

    // Delete file
    app.post('/api/delFile', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/delFile req.body', req.body);

      // Neuen Benutzer anlegen
      const result = await fileController.delFile(req.body.fileId);

      if (result.success) {
        // Erfolgsnachricht senden
        res.json({ result });
      } else {
        res.status(401).json({ message: result.message });
      }
    });

    // Update file
    app.post('/api/updateFile', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/updateFile req.body', req.body);

      // Neuen Benutzer anlegen
      const result = fileController.updateFile(req.body);

      if (result.success) {
        // Erfolgsnachricht senden
        res.json({ result });
      } else {
        res.status(401).json({ message: result.message });
      }
    });

    app.get('/api/downloadFile/:fileId', async (req, res) => {
      const fileId = req.params.fileId;

      // Hole die Datei basierend auf der ID
      const file = await fileController.getFileById(fileId, req, authMiddleware);

      if (!file.success) {
        return res.status(404).send(file.message);
      }

      const filePath = file.path; // Pfad zur Datei
      const fileName = file.name; // Originalname der Datei

      const contentType = mime.lookup(fileName) || 'application/octet-stream'; // Ermittele den MIME-Typ basierend auf der Dateiendung

      logger.info('Content-Type ', contentType);

      res.setHeader('Content-Type', contentType); // Setze den ermittelten MIME-Typ
      res.setHeader('Content-Disposition', `inline; filename="${fileName}"`); // "inline" zeigt die Datei im Browser an
      res.sendFile(filePath);
    });

    // Login-Route (POST)
    app.post('/api/login', async (req, res) => {
      // logger.fatal('/api/login req.body', req.body);
      const { username, password } = req.body;

      // Überprüfe Benutzername und Passwort
      const user = await loginController.loginUser(username, password);

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

      // logger.info('/api/getSession', token);

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

    // Benutzer ändern
    app.post('/api/changePassword', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/changePassword req.body', req.body);

      // Benutzer ändern
      const result = await userController.changePassword(req.body);

      if (result) {
        // Erfolgsnachricht senden
        res.json({ result });
      } else {
        res.status(401).json({ message: 'Fehler beim ändern des Passworts' });
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

    // update Sportfest
    app.post('/api/updateSportfest', authMiddleware.check('admin'), async (req, res) => {
      logger.fatal('/api/updateSportfest req.body', req.body);

      const result = sportfestController.updateSportfest(req.body.sportfest);

      if (result.success) {
        // Erfolgsnachricht senden
        res.json({ success: result.success });
      } else {
        res.status(401).json({ message: result.message });
      }
    });

    // edit Sportfest
    app.post('/api/editSportfest', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/editSportfest req.body', req.body);

      const io = sportfestController.editSportfest(req.body.sportfest);

      if (io) {
        // Erfolgsnachricht senden
        res.json({ io });
      } else {
        res.status(401).json({ message: 'Fehler bei editSportfest' });
      }
    });

    // edit Sportfest
    app.post('/api/editDescriptionSportfest', authMiddleware.check('benutzer'), async (req, res) => {
      logger.fatal('/api/editSportfest req.body', req.body);

      const io = sportfestController.editDescriptionSportfest(req.body.sportfest);

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
        const sportlerDreikampfOhneStaffel = meldungController.getSportleDreikampfOhneStaffel(req.body);

        res.json({
          klassen,
          sportlerDreikampfOhneStaffel
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

    // csv export
    app.get('/api/exportDreikampf/:sportfestId', authMiddleware.check('admin'), async (req, res) => {
      try {
        const csv = meldungController.exportDreikampfCSV(req.params.sportfestId);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="MeldungenDreikampf.txt"');
        res.send(csv);
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    app.get('/api/exportDreikampf/:sportfestId/:vereinId', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const csv = meldungController.exportDreikampfVereinCSV(req.params.sportfestId, req.params.vereinId);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="MeldungenDreikampfVerein.txt"');
        res.send(csv);
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    app.get('/api/exportStaffel/:sportfestId', authMiddleware.check('admin'), async (req, res) => {
      try {
        const csv = staffelController.exportexportStaffelCSV(req.params.sportfestId);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="MeldungStaffel.txt"');
        res.send(csv);
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });

    app.get('/api/exportStaffelVerein/:sportfestId/:vereinId', authMiddleware.check('benutzer'), async (req, res) => {
      try {
        const csv = staffelController.exportexportStaffelVereinCSV(req.params.sportfestId, req.params.vereinId);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="MeldungStaffelVerein.txt"');
        res.send(csv);
      } catch (error) {
        res.status(401).json({ message: error.message });
      }
    });
  }
};

export default apiRoutes;
