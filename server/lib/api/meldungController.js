/* eslint-disable class-methods-use-this */
import dbController from './dbController.js';
import logger from '../logger.js';

class MeldungController {
  async newMeldung (meldung) {
    try {
      const stmt = dbController.prepare(`
        INSERT INTO meldungen (dreikampf)
        VALUES (1)
      `);

      const info = stmt.run();

      logger.info(`${meldung} added successfully.`, info);

      const stmtMeldungenSportler = dbController.prepare(`
        INSERT INTO meldungen_sportler (meldungen_id, sportler_id)
        VALUES (?, ?)
      `);

      const infoMeldungenSportler = stmtMeldungenSportler.run(info.lastInsertRowid, meldung.sportlerId);

      logger.info(`infoMeldungSportler`, infoMeldungenSportler);

      const stmtMeldungenSportfest = dbController.prepare(`
        INSERT INTO meldungen_sportfest (meldungen_id, sportfest_id)
        VALUES (?, ?)
      `);

      const infoMeldungenSportfest = stmtMeldungenSportfest.run(info.lastInsertRowid, meldung.sportfestId);

      logger.info(`infoMeldungSportfest`, infoMeldungenSportfest);


      return info.lastInsertRowid;
    } catch (error) {
      logger.error(`Error adding new Meldung: ${error.message}`);

      return false;
    }
  }

  delMeldung (meldungId) {
    try {
      const stmt = dbController.prepare(`DELETE FROM meldungen WHERE id = ? `);
      const info = stmt.run(meldungId);

      logger.info(`Löschen erfolgreich.`, info);

      return true;
    } catch (error) {
      logger.error('Fehler beim löschen der Meldung:', error);

      throw new Error('Fehler beim löschen der Meldung.');
    }
  }
}

export default new MeldungController();
