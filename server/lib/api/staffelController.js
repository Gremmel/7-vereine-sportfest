/* eslint-disable class-methods-use-this */
import dbController from './dbController.js';
import logger from '../logger.js';

class StaffelController {
  getKlassen (staffelData) {
    try {
      const stmt = dbController.prepare(`SELECT * FROM klasse ORDER BY id `);
      const klassen = stmt.all();

      for (const klasse of klassen) {
        const stmt2 = dbController.prepare(`
          SELECT staffeln.*,
           COUNT(staffeln_meldungen.id) AS meldungenCount,
           SUM(CASE WHEN sportler.geschlecht = 'w' THEN 1 ELSE 0 END) AS weiblicheSportlerCount
          FROM staffeln
          LEFT JOIN staffeln_meldungen ON staffeln.id = staffeln_meldungen.staffelId
          LEFT JOIN sportler ON staffeln_meldungen.sportlerId = sportler.id
          WHERE sportfestId = ${staffelData.sportfestId}
          AND klassenId = ${klasse.id}
          AND vereinsId = ${staffelData.vereinsId}
          GROUP BY staffeln.id`);
        const staffeln = stmt2.all();

        // Delete all staffeln where meldungen_count === 0
        for (let i = staffeln.length - 1; i >= 0; i--) {
          if (staffeln[i].meldungenCount === 0) {
            const deleteStmt = dbController.prepare(`DELETE FROM staffeln WHERE id = ?`);

            deleteStmt.run(staffeln[i].id);
            staffeln.splice(i, 1); // Remove the deleted staffel from the array
          }
        }

        klasse.staffeln = staffeln;
      }

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
        ORDER BY sportler.jahrgang ASC, sportler.name ASC, sportler.vname ASC`);
      const klasseSportler = stmt.all();

      const filterdSportler = [];

      for (const sportler of klasseSportler) {
        const stmt2 = dbController.prepare(`
          SELECT staffeln_meldungen.id FROM staffeln_meldungen
          JOIN staffeln ON staffeln_meldungen.staffelid=staffeln.id
          WHERE staffeln.sportfestid=${klasseStaffel.sportfestId} AND staffeln_meldungen.sportlerid=${sportler.id}`);
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

  newStaffel (staffel) {
    try {
      const stmt = dbController.prepare(`
        INSERT INTO staffeln (vereinsId, klassenId, sportfestId)
        VALUES (?, ?, ?)`);

      const info = stmt.run(staffel.staffelVereinsId, staffel.klasseId, staffel.sportfestId);

      return info.lastInsertRowid;
    } catch (error) {
      logger.error('Fehler beim Erstellen der Staffel:', error);

      throw new Error('Konnte die Staffel nicht erstellen.');
    }
  }

  saveStaffelMeldungen (staffelMeldung) {
    try {
      // löschen der alten Meldungen
      const deleteStmt = dbController.prepare(`DELETE FROM staffeln_meldungen
        WHERE staffelId = ?`);

      deleteStmt.run(staffelMeldung.id);

      const stmt = dbController.prepare(`INSERT INTO staffeln_meldungen (staffelId, sportlerId, laeuferNr)
        VALUES (?, ?, ?)`);

      // Transaktion für mehrere Inserts
      const insertMany = dbController.transaction((obj) => {
        for (const [ key, value ] of Object.entries(obj)) {
          if (value !== null) {
            const laueferNr = parseInt(key.replace(/\D/gu, ''), 10); // Extract the number from the key

            stmt.run(staffelMeldung.id, value, laueferNr); // Corrected order of parameters
          }
        }
      });

      // Daten einfügen
      insertMany(staffelMeldung.meldungen);
    } catch (error) {
      logger.error('Fehler beim Erstellen der Staffel:', error);

      throw new Error('Konnte die Staffel nicht erstellen.');
    }
  }
}

export default new StaffelController();
