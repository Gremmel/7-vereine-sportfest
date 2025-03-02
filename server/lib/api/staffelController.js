/* eslint-disable class-methods-use-this */
import dbController from './dbController.js';
import logger from '../logger.js';

class StaffelController {
  getKlassen () {
    try {
      const stmt = dbController.prepare(`SELECT * FROM klasse ORDER BY id `);
      const klassen = stmt.all();

      return klassen;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Klassen:', error);

      throw new Error('Konnte keine Klassen abrufen.');
    }
  }

  getKlasseSportler (klasseStaffel) {
    try {
      const stmt = dbController.prepare(`
        SELECT sportler.*, (strftime('%Y', 'now') - sportler.jahrgang) AS sportleralter
        FROM sportler
        JOIN sportler_verein ON sportler.id=sportler_verein.sportler_id
        WHERE sportler_verein.verein_id = ${klasseStaffel.staffelVereinsId}
        AND sportleralter <= ${klasseStaffel.maxalter}
        AND sportleralter >= ${klasseStaffel.minalter}
        ${klasseStaffel.gemixt === '1' ? `AND sportler.geschlecht IN ('m', 'w')` : `AND sportler.geschlecht = '${klasseStaffel.geschlecht}'`}
        ORDER BY sportler.jahrgang DESC, sportler.name ASC, sportler.vname ASC`);
      const klasseSportler = stmt.all();

      const filterdSportler = [];

      for (const sportler of klasseSportler) {
        const stmt2 = dbController.prepare(`
          SELECT staffeln_meldungen.id FROM staffeln_meldungen
          JOIN staffeln ON staffeln_meldungen.staffelid=staffeln.id
          WHERE staffeln.sportfestid=${klasseStaffel.sportfestId}`);
        const result = stmt2.all();

        if (result.length === 0) {
          filterdSportler.push(sportler);
        }
      }

      return filterdSportler;
    } catch (error) {
      logger.error('Fehler beim Abrufen der getKlasseSportler:', error);

      throw new Error('Konnte keine getKlasseSportler abrufen.');
    }
  }
}

export default new StaffelController();
