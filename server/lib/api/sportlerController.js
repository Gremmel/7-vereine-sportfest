/* eslint-disable class-methods-use-this */
// userController.mjs
import dbController from './dbController.js';
import logger from '../logger.js';

class SportlerController {
  getSportlerByVereinsID (vereinsID) {
    try {
      const stmt = dbController.prepare(`SELECT sportler.* FROM sportler LEFT JOIN sportler_verein ON sportler.id=sportler_verein.sportler_id WHERE sportler_verein.verein_id ='${vereinsID}' ORDER BY sportler.name `);
      const sportler = stmt.all();

      return sportler;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Sportler:', error);

      throw new Error('Konnte keine Sportler abrufen.');
    }
  }
}

export default new SportlerController();
