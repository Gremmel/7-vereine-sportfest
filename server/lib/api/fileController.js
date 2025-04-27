import logger from '../logger.js';
import dbController from './dbController.js';

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const fileController = {
  async handleMultipleFileUpload (files) {
    try {
      if (!files || files.length === 0) {
        throw new Error('Keine Dateien hochgeladen');
      }

      logger.info('Dateien erfolgreich hochgeladen:', files);

      // Dateien in die Datenbank speichern
      const insertStmt = dbController.prepare('INSERT INTO media (name, orgname, file) VALUES (?, ?, ?)');
      const insertFiles = files.map((file) => {
        const { originalname, filename } = file;

        return insertStmt.run(originalname, originalname, filename);
      });

      logger.info('Dateien erfolgreich in die Datenbank eingefügt:', insertFiles);

      return {
        success: true,
        files
      };
    } catch (error) {
      logger.error('Fehler beim Upload:', error);

      return { success: false, message: error.message };
    }
  },

  async getFileById (fileId) {
    try {
      if (!fileId) {
        throw new Error('Keine Dateien hochgeladen');
      }

      const stmt = dbController.prepare('SELECT * FROM media WHERE id = ?');
      const file = stmt.get(fileId);

      if (!file) {
        throw new Error('Datei nicht gefunden');
      }
      logger.info('Datei erfolgreich abgerufen:', file);

      const filename = fileURLToPath(import.meta.url);
      const dirname = path.dirname(filename);
      const filePath = path.join(dirname, '..', '..', '..', 'extern', 'uploads', file.file);

      return {
        path: path.resolve(filePath), // Pfad zur Datei
        name: file.orgname // Originalname der Datei
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateFile (file) {
    try {
      if (!file || !file.id) {
        throw new Error('Keine Datei Daten');
      }

      const stmt = dbController.prepare('UPDATE media SET name = ?, oeffentlich = ?, sportfestId = ? WHERE id = ?');
      const { name, oeffentlich, sportfestId, id } = file;

      stmt.run(name, oeffentlich, sportfestId, id);

      logger.info('Datei erfolgreich in die Datenbank aktualisiert:', file);

      return {
        success: true
      };
    } catch (error) {
      logger.error('Fehler beim Aktualisieren der Datei:', error);

      return { success: false, message: error.message };
    }
  },

  async delFile (fileId) {
    try {
      // Überprüfen, ob die Datei existiert
      const stmt = dbController.prepare('SELECT * FROM media WHERE id = ?');
      const file = stmt.get(fileId);

      if (!file) {
        throw new Error('Datei nicht gefunden');
      }

      // Datei aus der Datenbank löschen
      const deleteStmt = dbController.prepare('DELETE FROM media WHERE id = ?');

      deleteStmt.run(fileId);

      logger.info('Datei erfolgreich aud db gelöscht:', fileId);

      const filename = fileURLToPath(import.meta.url);
      const dirname = path.dirname(filename);
      const filePath = path.join(dirname, '..', '..', '..', 'extern', 'uploads', file.file);

      try {
        await fs.unlink(filePath);

        logger.info('Datei erfolgreich gelöscht:', filePath);
      } catch (error) {
        logger.error('Fehler beim Löschen der Datei:', error);
        throw new Error('Fehler beim Löschen der Datei');
      }

      return { success: true };
    } catch (error) {
      logger.error('Fehler beim Löschen der Datei:', error);

      return { success: false, message: error.message };
    }
  },

  getFileList () {
    try {
      // Datenbankabfrage, um alle Dateien aus der Tabelle "media" zu holen
      const stmt = dbController.prepare('SELECT * FROM media');
      const fileList = stmt.all();

      // Erfolgreiche Antwort mit den Dateien
      return fileList;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Dateiliste:', error);

      return false;
    }
  },

  getFileListHome () {
    try {
      // Datenbankabfrage, um alle Dateien aus der Tabelle "media" zu holen
      const stmt = dbController.prepare('SELECT * FROM media WHERE oeffentlich = 1');
      const fileList = stmt.all();

      // Erfolgreiche Antwort mit den Dateien
      return fileList;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Dateiliste:', error);

      return false;
    }
  }

};

export default fileController;
