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
      logger.error('Fehler beim Abrufen der getAllSportler:', error);

      throw new Error('Konnte keine getAllSportler abrufen.');
    }
  }

  getFestSportlerList (data) {
    let sportlerList;

    if (data.isAdmin) {
      try {
        const stmt = dbController.prepare(`
          SELECT sportler.*, sportler_verein.verein_id as vereinsid
          FROM sportler
          LEFT JOIN sportler_verein on sportler.id=sportler_verein.sportler_id
          LEFT JOIN sportfest_verein ON sportler_verein.verein_id=sportfest_verein.verein_id
          WHERE sportfest_verein.sportfest_id= ${data.sportfestId} ORDER BY sportler.name`);

        sportlerList = stmt.all();
      } catch (error) {
        logger.error('Fehler beim Abrufen der getFestSportlerList:', error);

        throw new Error('Konnte keine getFestSportlerList abrufen.');
      }
    } else {
      try {
        const stmt = dbController.prepare(`
          SELECT sportler.*, sportler_verein.verein_id as vereinsid
          FROM sportler
          LEFT JOIN sportler_verein ON sportler.id=sportler_verein.sportler_id
          LEFT JOIN sportfest_verein ON sportler_verein.verein_id=sportfest_verein.verein_id AND sportfest_verein.sportfest_id=${data.sportfestId}
          WHERE  sportler_verein.verein_id = ${data.vereinsId}
          ORDER BY sportler.name`);

        sportlerList = stmt.all();
      } catch (error) {
        logger.error('Fehler beim Abrufen der getFestSportlerList:', error);

        throw new Error('Konnte keine getFestSportlerList abrufen.');
      }
    }

    logger.warn(' sportlerList', sportlerList);
    const hochsprungMinHoehe = {};

    try {
      const stmt = dbController.prepare(`
        SELECT *
        FROM hochsprungMinHoehe`);

      const hochsprungMinHoeheArray = stmt.all();

      for (const item of hochsprungMinHoeheArray) {
        hochsprungMinHoehe[item.alter] = item;
      }
    } catch (error) {
      logger.error('Fehler beim Abrufen der hochsprungMinHoehe:', error);

      throw new Error('Fehler beim Abrufen der hochsprungMinHoehe:', error);
    }

    for (const sportler of sportlerList) {
      try {
        logger.warn(' hochsprungMinHoehe', hochsprungMinHoehe);

        const stmt = dbController.prepare(`
          SELECT *
          FROM meldungen
          Left JOIN meldungen_sportler ON meldungen.id=meldungen_sportler.meldungen_id
          LEFT JOIN meldungen_sportfest ON meldungen.id=meldungen_sportfest.meldungen_id
          WHERE sportler_id=${sportler.id} AND sportfest_id=${data.sportfestId}`);
        const meldungen = stmt.all();

        if (meldungen.length === 1) {
          sportler.dreikampf = meldungen[0].dreikampf;
          sportler.hoehe = meldungen[0].hoehe;
          sportler.meldungId = meldungen[0].id;
        } else {
          sportler.dreikampf = 0;
          sportler.hoehe = null;
          sportler.meldungId = null;
        }

        // Alter berechnen
        sportler.alter = new Date().getFullYear() - sportler.jahrgang;

        // Mindesthöhe für Hochsprung berechnen
        if (sportler.geschlecht === 'w' && sportler.alter > 9 && sportler.alter < 21) {
          sportler.minHoehe = hochsprungMinHoehe[sportler.alter].wHoehe;
        } else if (sportler.geschlecht === 'm' && sportler.alter > 9 && sportler.alter < 21) {
          sportler.minHoehe = hochsprungMinHoehe[sportler.alter].mHoehe;
        } else if (sportler.alter > 20 && sportler.geschlecht === 'w') {
          sportler.minHoehe = hochsprungMinHoehe[20].wHoehe;
        } else if (sportler.alter > 20 && sportler.geschlecht === 'm') {
          sportler.minHoehe = hochsprungMinHoehe[20].mHoehe;
        } else {
          sportler.minHoehe = null;
        }
      } catch (error) {
        logger.error('Fehler beim Abrufen der getFestSportlerList:', error);

        throw new Error('Konnte keine getFestSportlerList abrufen.');
      }
    }

    return sportlerList;
  }

  async newSportler (sportler) {
    try {
      const stmt = dbController.prepare(`
        INSERT INTO sportler (name, vname, jahrgang, geschlecht)
        VALUES (?, ?, ?, ?)
      `);

      const info = stmt.run(sportler.name, sportler.vname, sportler.jahrgang, sportler.geschlecht);

      logger.info(`${sportler} added successfully.`, info);

      const stmtSportlerVerein = dbController.prepare(`
        INSERT INTO sportler_verein (sportler_id, verein_id)
        VALUES (?, ?)
      `);

      const infoSportlerVerein = stmtSportlerVerein.run(info.lastInsertRowid, sportler.vereinsid);

      logger.info(`infoSportlerVerein`, infoSportlerVerein);

      return info.lastInsertRowid;
    } catch (error) {
      logger.error(`Error adding new Sportler: ${error.message}`);

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
      logger.error(`Error edit Sportler: ${error.message}`);

      return false;
    }
  }

  async delSportler (delSportlerId) {
    try {
      const stmt = dbController.prepare(`
        DELETE FROM sportler
        WHERE id = ?
      `);
      const info = stmt.run(delSportlerId);

      logger.info(`Löschen erfolgreich.`, info);

      const stmtSportlerVerein = dbController.prepare(`
        DELETE FROM sportler_verein
        WHERE sportler_id = ?
      `);

      const infoSportlerVerein = stmtSportlerVerein.run(delSportlerId);

      logger.info('infoSportlerVerein', infoSportlerVerein);

      return true;
    } catch (error) {
      logger.error(`Error Sportler DELETE: ${error.message}`);

      return false;
    }
  }
}

export default new SportlerController();
