/* eslint-disable class-methods-use-this */
// userController.mjs
import dbController from './dbController.js';
import logger from '../logger.js';

class SportlerController {
  getSportlerByVereinsID (vereinsID) {
    try {
      const stmt = dbController.prepare(`SELECT sportler.*, sportler_verein.verein_id AS vereinsid FROM sportler LEFT JOIN sportler_verein ON sportler.id=sportler_verein.sportler_id LEFT JOIN verein ON sportler_verein.verein_id=verein.id WHERE sportler_verein.verein_id ='${vereinsID}' ORDER BY sportler.name `);
      const sportler = stmt.all();

      return sportler;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Sportler:', error);

      throw new Error('Konnte keine Sportler abrufen.');
    }
  }

  getAllSportler () {
    try {
      const stmt = dbController.prepare(`SELECT sportler.*, verein.id as vereinsid FROM sportler LEFT JOIN sportler_verein ON sportler.id=sportler_verein.sportler_id LEFT JOIN verein ON sportler_verein.verein_id=verein.id WHERE 1 ORDER BY sportler.name `);
      const sportler = stmt.all();

      return sportler;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Sportler:', error);

      throw new Error('Konnte keine Sportler abrufen.');
    }
  }

  async newSportler (sportler) {
    const stmt = dbController.prepare(`
      INSERT INTO sportler (name, vname, jahrgang, geschlecht)
      VALUES (?, ?, ?, ?)
    `);

    try {
      const info = stmt.run(sportler.name, sportler.vname, sportler.jahrgang, sportler.geschlecht);

      const stmtSportlerVerein = dbController.prepare(`
        INSERT INTO sportler_verein (sportler_id, verein_id)
        VALUES (?, ?)
      `);

      const infoSportlerVerein = stmtSportlerVerein.run(info.lastInsertRowid, sportler.vereinsid);

      logger.info(`${sportler} added successfully.`, info);

      return info.lastInsertRowid;
    } catch (error) {
      logger.error(`Error adding user: ${error.message}`);

      return false;
    }
  }

  async editSportler (sportler) {
    try {
      const stmt = dbController.prepare(`
        UPDATE sportler
        SET name = ?, vname = ?, jahrgang = ?, geschlecht = ?
        WHERE id = ?
      `);
      const info = stmt.run(sportler.name, sportler.vname, sportler.jahrgang, sportler.geschlecht, sportler.id);

      logger.info(`${sportler} added successfully.`, info);

      const stmtSportlerVerein = dbController.prepare(`
        UPDATE sportler_verein SET verein_id = ?
        WHERE sportler_id = ?
      `);

      const infoSportlerVerein = stmtSportlerVerein.run(sportler.vereinsid, sportler.id);

      logger.info('infoSportlerVerein', infoSportlerVerein);

      return true;
    } catch (error) {
      logger.error(`Error adding user: ${error.message}`);

      return false;
    }
  }
}

export default new SportlerController();
