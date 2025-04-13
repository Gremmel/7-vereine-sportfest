import logger from '../logger.js';
import dbController from './dbController.js';

const fileController = {
  async handleMultipleFileUpload (files) {
    try {
      if (!files || files.length === 0) {
        throw new Error('Keine Dateien hochgeladen');
      }

      logger.info('Dateien erfolgreich hochgeladen:', files);

      return {
        success: true,
        files
      };
    } catch (error) {
      logger.error('Fehler beim Upload:', error);

      return { success: false, message: error.message };
    }
  },

  async getFileList () {
    try {
      // Datenbankabfrage, um alle Dateien aus der Tabelle "media" zu holen
      const stmt = dbController.prepare('SELECT * FROM media');
      const files = stmt.all();

      // Erfolgreiche Antwort mit den Dateien
      return files;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Dateiliste:', error);

      return false;
    }
  }
};

export default fileController;
