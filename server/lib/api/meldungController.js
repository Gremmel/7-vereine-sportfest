/* eslint-disable class-methods-use-this */
import dbController from './dbController.js';
import logger from '../logger.js';
import { stringify } from 'csv-stringify/sync'; // CSV-Stringify-Bibliothek importieren

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

  async hoeheMeldung (hoeheMeldung) {
    try {
      const stmt = dbController.prepare(`
        UPDATE meldungen
        SET hoehe = ?
        WHERE id = ?
      `);

      stmt.bind(hoeheMeldung.hoehe, hoeheMeldung.meldungId);

      const info = stmt.run();

      logger.info(`change successfully.`, info);

      return true;
    } catch (error) {
      logger.error(`Error change Hoehmeldung: ${error.message}`);

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

  getSportleDreikampfOhneStaffel (staffelData) {
    try {
      const stmt = dbController.prepare(`
        SELECT
            s.id AS sportlerId,
            s.name AS name,
            s.vname AS vname,
            s.jahrgang AS jahrgang,
            s.geschlecht AS geschlecht
        FROM
            sportler s
        INNER JOIN
            meldungen_sportler ms ON s.id = ms.sportler_id
        INNER JOIN
            meldungen_sportfest msf ON ms.meldungen_id = msf.meldungen_id
        LEFT JOIN
            staffeln_meldungen sm ON ms.sportler_id = sm.sportlerId
        INNER JOIN
            sportler_verein sv ON s.id = sv.sportler_id
        WHERe  msf.sportfest_id = ? AND sv.verein_id = ? AND sm.staffelId IS NULL
        ORDER BY
            s.jahrgang DESC, s.name, s.vname
      `);

      const rows = stmt.all(staffelData.sportfestId, staffelData.vereinsId);

      // logger.info('Sportler ohne Staffel:', rows);

      return rows;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Sportler ohne Staffel:', error);
      throw new Error('Fehler beim Abrufen der Sportler ohne Staffel.');
    }
  }

  exportDreikampfCSV (sportfestId) {
    try {
      const stmt = dbController.prepare(`
        SELECT
            v.name AS Verein,
            s.name AS Name,
            s.vname AS Vorname,
            s.jahrgang AS JG,
            s.geschlecht AS GS,
            m.hoehe AS "AH Hochsprung"
        FROM
            meldungen m
        INNER JOIN
            meldungen_sportfest msf ON m.id = msf.meldungen_id
        INNER JOIN
            sportfest sf ON msf.sportfest_id = sf.id
        INNER JOIN
            meldungen_sportler ms ON m.id = ms.meldungen_id
        INNER JOIN
            sportler s ON ms.sportler_id = s.id
        INNER JOIN
            sportler_verein sv ON s.id = sv.sportler_id
        INNER JOIN
            verein v ON sv.verein_id = v.id
        WHERE
            sf.id = ?
        ORDER BY
            v.name, s.name, s.vname
      `);

      const rows = stmt.all(sportfestId);

      logger.info('Exportierte Zeilen:', rows);

      // CSV-Format erstellen
      const csv = stringify(rows, {
        header: true,
        delimiter: ';',
        columns: [ 'Verein', 'Name', 'Vorname', 'JG', 'GS', 'AH Hochsprung' ]
      });

      return csv;
    } catch (error) {
      logger.error('Fehler beim Exportieren der Meldung als CSV:', error);
      throw new Error('Fehler beim Exportieren der Meldung als CSV.');
    }
  }

  exportDreikampfVereinCSV (sportfestId, vereinId) {
    try {
      const stmt = dbController.prepare(`
        SELECT
            v.name AS Verein,
            s.name AS Name,
            s.vname AS Vorname,
            s.jahrgang AS JG,
            s.geschlecht AS GS,
            m.hoehe AS "AH Hochsprung"
        FROM
            meldungen m
        INNER JOIN
            meldungen_sportfest msf ON m.id = msf.meldungen_id
        INNER JOIN
            sportfest sf ON msf.sportfest_id = sf.id
        INNER JOIN
            meldungen_sportler ms ON m.id = ms.meldungen_id
        INNER JOIN
            sportler s ON ms.sportler_id = s.id
        INNER JOIN
            sportler_verein sv ON s.id = sv.sportler_id
        INNER JOIN
            verein v ON sv.verein_id = v.id
        WHERE
            sf.id = ? AND sv.verein_id = ?
        ORDER BY
            v.name, s.name, s.vname
      `);

      const rows = stmt.all(sportfestId, vereinId);

      logger.info('Exportierte Zeilen:', rows);

      // CSV-Format erstellen
      const csv = stringify(rows, {
        header: true,
        delimiter: ';',
        columns: [ 'Verein', 'Name', 'Vorname', 'JG', 'GS', 'AH Hochsprung' ]
      });

      return csv;
    } catch (error) {
      logger.error('Fehler beim Exportieren der Meldung als CSV:', error);
      throw new Error('Fehler beim Exportieren der Meldung als CSV.');
    }
  }
}

export default new MeldungController();
