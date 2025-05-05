/* eslint-disable camelcase */
/* eslint-disable class-methods-use-this */
import dbController from './dbController.js';
import logger from '../logger.js';
import { stringify } from 'csv-stringify/sync'; // CSV-Stringify-Bibliothek importieren

class StaffelController {
  // alleSportlrer die noch nicht für die Staffel gemeldet sind
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

        for (const staffel of staffeln) {
          const stmt3 = dbController.prepare(`
            SELECT sportler.*, (strftime('%Y', 'now') - sportler.jahrgang) AS sportleralter,
             staffeln_meldungen.laeuferNr AS laeuferNr
            FROM sportler
            JOIN staffeln_meldungen ON sportler.id = staffeln_meldungen.sportlerId
            WHERE staffeln_meldungen.staffelId = ${staffel.id}
            ORDER BY laeuferNr ASC`);
          const staffelSportler = stmt3.all();

          staffel.staffelSportler = staffelSportler;
        }

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

  async delStaffel (delStaffelId) {
    try {
      const stmt = dbController.prepare(`
        DELETE FROM staffeln
        WHERE id = ?
      `);
      const info = stmt.run(delStaffelId);

      logger.info(`Löschen erfolgreich.`, info);

      return true;
    } catch (error) {
      logger.error(`Error Staffel DELETE: ${error.message}`);

      return false;
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

  toRoman (num) {
    const romanNumerals = [
      { value: 100, numeral: 'C' },
      { value: 90, numeral: 'XC' },
      { value: 50, numeral: 'L' },
      { value: 40, numeral: 'XL' },
      { value: 10, numeral: 'X' },
      { value: 9, numeral: 'IX' },
      { value: 5, numeral: 'V' },
      { value: 4, numeral: 'IV' },
      { value: 1, numeral: 'I' }
    ];

    let result = '';

    for (const { value, numeral } of romanNumerals) {
      while (num >= value) {
        result += numeral;
        // eslint-disable-next-line no-param-reassign
        num -= value;
      }
    }

    return result;
  }

  exportexportStaffelCSV (sportfestId) {
    try {
      const stmt = dbController.prepare(`
        SELECT
          v.name AS Verein,
          k.name AS 'Klasse Staffel',
          s.id AS staffelId
        FROM
          staffeln s
        INNER JOIN
        verein v ON s.vereinsId = v.id
        INNER JOIN
          klasse k ON s.klassenId = k.id
        WHERE
          s.sportfestId = ?
        ORDER BY
          v.name DESC, k.id ASC
      `);

      const rows = stmt.all(sportfestId);

      // Verein;Klasse Staffel;Vorname1;Name1;G 1;JG 1;Vorname2;Name2;G 2;JG 2;Vorname3;Name3;G 3;JG 3;Vorname4;Name4;G 4;JG 4
      // TV Nesselwang;männliche Jugend U18/20;Sebastian;Wagner;m;2001;Lukas;French;m;2001;Tom;French;m;2002;Jacob;Erhart;m;2002
      for (const row of rows) {
        const stmt2 = dbController.prepare(`
          SELECT
            s.vname AS Vorname,
            s.name AS Name,
            s.geschlecht AS GS,
            s.jahrgang AS JG
          FROM
            staffeln_meldungen sm
          INNER JOIN
            sportler s ON sm.sportlerId = s.id
          WHERE
            sm.staffelId = ?
          ORDER BY
            sm.laeuferNr
        `);

        const sportler = stmt2.all(row.staffelId);

        row.Vorname1 = sportler[0]?.Vorname || '';
        row.Name1 = sportler[0]?.Name || '';
        row['G 1'] = sportler[0]?.GS || '';
        row['JG 1'] = sportler[0]?.JG || '';
        row.Vorname2 = sportler[1]?.Vorname;
        row.Name2 = sportler[1]?.Name || '';
        row['G 2'] = sportler[1]?.GS || '';
        row['JG 2'] = sportler[1]?.JG || '';
        row.Vorname3 = sportler[2]?.Vorname || '';
        row.Name3 = sportler[2]?.Name || '';
        row['G 3'] = sportler[2]?.GS || '';
        row['JG 3'] = sportler[2]?.JG || '';
        row.Vorname4 = sportler[3]?.Vorname || '';
        row.Name4 = sportler[3]?.Name || '';
        row['G 4'] = sportler[3]?.GS || '';
        row['JG 4'] = sportler[3]?.JG || '';
      }

      logger.info('Exportierte Zeilen:', rows);

      const vereinCount = {};

      for (const row of rows) {
        const key = `${row.Verein}-${row['Klasse Staffel']}`;

        if (!vereinCount[key]) {
          vereinCount[key] = 1;
          row.Verein += ` ${this.toRoman(vereinCount[key])}`;
        } else {
          vereinCount[key] += 1;
          row.Verein += ` ${this.toRoman(vereinCount[key])}`;
        }
      }

      // CSV-Format erstellen
      const csv = stringify(rows, {
        header: true,
        delimiter: ';',
        record_delimiter: '\r\n', // Windows-Zeilenumbruch
        columns: [ 'Verein', 'Klasse Staffel', 'Vorname1', 'Name1', 'G 1', 'JG 1',
          'Vorname2', 'Name2', 'G 2', 'JG 2',
          'Vorname3', 'Name3', 'G 3', 'JG 3',
          'Vorname4', 'Name4', 'G 4', 'JG 4' ]
      });

      return csv;
    } catch (error) {
      logger.error('Fehler beim Exportieren der Meldung als CSV:', error);
      throw new Error('Fehler beim Exportieren der Meldung als CSV.');
    }
  }

  exportexportStaffelVereinCSV (sportfestId, vereinId) {
    try {
      const stmt = dbController.prepare(`
        SELECT
          v.name AS Verein,
          k.name AS 'Klasse Staffel',
          s.id AS staffelId
        FROM
          staffeln s
        INNER JOIN
        verein v ON s.vereinsId = v.id
        INNER JOIN
          klasse k ON s.klassenId = k.id
        WHERE
          s.sportfestId = ? AND s.vereinsId = ?
        ORDER BY
          v.name DESC, k.id ASC
      `);

      const rows = stmt.all(sportfestId, vereinId);

      // Verein;Klasse Staffel;Vorname1;Name1;G 1;JG 1;Vorname2;Name2;G 2;JG 2;Vorname3;Name3;G 3;JG 3;Vorname4;Name4;G 4;JG 4
      // TV Nesselwang;m�nnliche Jugend U18/20;Sebastian;Wagner;m;2001;Lukas;French;m;2001;Tom;French;m;2002;Jacob;Erhart;m;2002
      for (const row of rows) {
        const stmt2 = dbController.prepare(`
          SELECT
            s.vname AS Vorname,
            s.name AS Name,
            s.geschlecht AS GS,
            s.jahrgang AS JG
          FROM
            staffeln_meldungen sm
          INNER JOIN
            sportler s ON sm.sportlerId = s.id
          WHERE
            sm.staffelId = ?
          ORDER BY
            sm.laeuferNr
        `);

        const sportler = stmt2.all(row.staffelId);

        row.Vorname1 = sportler[0]?.Vorname || '';
        row.Name1 = sportler[0]?.Name || '';
        row['G 1'] = sportler[0]?.GS || '';
        row['JG 1'] = sportler[0]?.JG || '';
        row.Vorname2 = sportler[1]?.Vorname;
        row.Name2 = sportler[1]?.Name || '';
        row['G 2'] = sportler[1]?.GS || '';
        row['JG 2'] = sportler[1]?.JG || '';
        row.Vorname3 = sportler[2]?.Vorname || '';
        row.Name3 = sportler[2]?.Name || '';
        row['G 3'] = sportler[2]?.GS || '';
        row['JG 3'] = sportler[2]?.JG || '';
        row.Vorname4 = sportler[3]?.Vorname || '';
        row.Name4 = sportler[3]?.Name || '';
        row['G 4'] = sportler[3]?.GS || '';
        row['JG 4'] = sportler[3]?.JG || '';
      }

      logger.info('Exportierte Zeilen:', rows);

      // CSV-Format erstellen
      const csv = stringify(rows, {
        header: true,
        delimiter: ';',
        record_delimiter: '\r\n', // Windows-Zeilenumbruch
        columns: [ 'Verein', 'Klasse Staffel', 'Vorname1', 'Name1', 'G 1', 'JG 1',
          'Vorname2', 'Name2', 'G 2', 'JG 2',
          'Vorname3', 'Name3', 'G 3', 'JG 3',
          'Vorname4', 'Name4', 'G 4', 'JG 4' ]
      });

      return csv;
    } catch (error) {
      logger.error('Fehler beim Exportieren der Meldung als CSV:', error);
      throw new Error('Fehler beim Exportieren der Meldung als CSV.');
    }
  }
}

export default new StaffelController();
