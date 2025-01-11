/* eslint-disable class-methods-use-this */
import dbController from './dbController.js';
import logger from '../logger.js';

class VereineController {
  getVereine () {
    try {
      const stmt = dbController.prepare(`SELECT * FROM verein ORDER BY name `);
      const vereine = stmt.all();

      return vereine;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Vereine:', error);

      throw new Error('Konnte keine Vereine abrufen.');
    }
  }
}

export default new VereineController();
