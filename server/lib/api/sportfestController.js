/* eslint-disable class-methods-use-this */
import dbController from './dbController.js';
import logger from '../logger.js';

class SportfestController {
  getAktiveSportfeste (user) {
    try {
      const isAdmin = user.roles.includes('admin');

      if (isAdmin) {
        const stmt = dbController.prepare(
          ` SELECT sportfest.*, GROUP_CONCAT(sportfest_disziplin.disziplin_id) AS disziplinen FROM sportfest JOIN sportfest_disziplin ON sportfest.id=sportfest_disziplin.sportfest_id WHERE meldeende > DATE('now') GROUP BY sportfest.id ORDER BY meldeende DESC`
        );
        const sportfeste = stmt.all();

        return sportfeste;
      }

      const stmt = dbController.prepare(
        `SELECT sportfest.*, GROUP_CONCAT(sportfest_disziplin.disziplin_id) AS disziplinen FROM sportfest JOIN sportfest_verein ON sportfest.id=sportfest_verein.sportfest_id JOIN sportfest_disziplin ON sportfest.id=sportfest_disziplin.sportfest_id WHERE sportfest_verein.verein_id=${user.verein_id} AND meldeende > DATE('now') GROUP BY sportfest.id ORDER BY meldeende DESC`
      );

      const sportfeste = stmt.all();

      return sportfeste;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Sportfeste:', error);

      throw new Error('Fehler beim Abrufen der Sportfeste:', error);
    }
  }

  getSportfestListHome () {
    try {
      const stmt = dbController.prepare(
        `SELECT sportfest.*,
            sportfest_adminverein.verein_id AS admin_verein_id,
            verein.name AS admin_verein_name,
            (SELECT GROUP_CONCAT(verein.name)
             FROM sportfest_verein
             LEFT JOIN verein ON verein.id = sportfest_verein.verein_id
             WHERE sportfest_verein.sportfest_id = sportfest.id ) AS vereine
         FROM sportfest
         LEFT JOIN sportfest_adminverein ON sportfest_adminverein.sportfest_id = sportfest.id
         LEFT JOIN verein ON sportfest_adminverein.verein_id = verein.id
         ORDER BY meldeende ASC`
      );

      const sportfeste = stmt.all();

      return sportfeste;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Sportfeste:', error);

      throw new Error('Fehler beim Abrufen der Sportfeste:', error);
    }
  }

  getSportfestList () {
    try {
      const stmt = dbController.prepare(
        `SELECT * FROM sportfest ORDER BY name ASC`
      );

      const sportfeste = stmt.all();

      // disziplinen abfragen
      for (const sportfest of sportfeste) {
        const disziplinStmt = dbController.prepare(
          `SELECT disziplin_id FROM sportfest_disziplin WHERE sportfest_id = ?`
        );

        logger.warn(' typeof sportfest.id', typeof sportfest.id);
        const disziplinen = disziplinStmt.all(sportfest.id.toString()).map(
          (disziplin) => disziplin.disziplin_id
        );

        logger.info(' disziplinen', disziplinen);

        sportfest.disziplinen = disziplinen;

        // vereine abfragen die zugeordnet sind
        const stmtVereine = dbController.prepare(
          `SELECT verein_id FROM sportfest_verein WHERE sportfest_verein.sportfest_id = ?`
        );

        const vereine = stmtVereine.all(sportfest.id.toString()).map(
          (verein) => verein.verein_id
        );

        sportfest.vereine = vereine;

        // adminverein abfragen
        const stmtAdminVerein = dbController.prepare(
          `SELECT verein_id FROM sportfest_adminverein WHERE sportfest_adminverein.sportfest_id = ?`
        );
        const adminVerein = stmtAdminVerein.get(sportfest.id.toString())?.verein_id || null;

        sportfest.adminVerein = adminVerein;
      }

      // alle disziplinen abfragen
      const stmtDisziplinen = dbController.prepare(
        `SELECT * FROM disziplin ORDER BY name ASC`
      );

      const disziplinen = stmtDisziplinen.all();

      return {
        sportfestList: sportfeste,
        disziplinenList: disziplinen
      };
    } catch (error) {
      logger.error('Fehler beim Abrufen der Sportfeste:', error);

      throw new Error('Fehler beim Abrufen der Sportfeste:', error);
    }
  }

  delSportfest (sportfestId) {
    try {
      // Sportfest löschen
      const stmt = dbController.prepare(
        `DELETE FROM sportfest WHERE id = ?`
      );

      stmt.run(sportfestId.toString());

      return true;
    } catch (error) {
      logger.error('Fehler beim Löschen des Sportfests:', error);
      throw new Error('Fehler beim Löschen des Sportfests:', error);
    }
  }

  newSportfest (sportfest) {
    try {
      // Neues Sportfest in die Tabelle sportfest einfügen
      const stmt = dbController.prepare(
        `INSERT INTO sportfest (name, description, ort, startdate, meldeende, oeffentlich) VALUES (?, ?, ?, ?, ?, ?)`
      );

      const result = stmt.run(
        sportfest.name,
        sportfest.description || '', // Optional: Beschreibung
        sportfest.ort,
        sportfest.startdate,
        sportfest.meldeende,
        1 // Öffentlichkeitsstatus (z. B. 1 für öffentlich)
      );

      const sportfestId = result.lastInsertRowid;

      // Disziplinen zuordnen
      if (sportfest.disziplinen && sportfest.disziplinen.length > 0) {
        const disziplinStmt = dbController.prepare(
          `INSERT INTO sportfest_disziplin (sportfest_id, disziplin_id) VALUES (?, ?)`
        );

        for (const disziplinId of sportfest.disziplinen) {
          disziplinStmt.run(sportfestId, disziplinId);
        }
      }

      // Vereine zuordnen
      if (sportfest.vereine && sportfest.vereine.length > 0) {
        const vereinStmt = dbController.prepare(
          `INSERT INTO sportfest_verein (sportfest_id, verein_id) VALUES (?, ?)`
        );

        for (const vereinId of sportfest.vereine) {
          vereinStmt.run(sportfestId, vereinId);
        }
      }

      // Admin-Verein zuordnen
      if (sportfest.adminVerein) {
        const adminStmt = dbController.prepare(
          `INSERT INTO sportfest_adminverein (sportfest_id, verein_id) VALUES (?, ?)`
        );

        adminStmt.run(sportfestId, sportfest.adminVerein);
      }

      return { success: true, sportfestId };
    } catch (error) {
      logger.error('Fehler beim Anlegen des Sportfests:', error);
      throw new Error('Fehler beim Anlegen des Sportfests:', error);
    }
  }

  editSportfest (sportfest) {
    try {
      const stmt = dbController.prepare(
        `UPDATE sportfest SET name=?, ort=?, description=?, startdate=?, meldeende=? WHERE id=?`
      );

      stmt.run(
        sportfest.name,
        sportfest.ort,
        sportfest.description || '',
        sportfest.startdate,
        sportfest.meldeende,
        sportfest.id
      );

      // HINWEIS:
      // Auskommentiert weil dann Meldungen die sich auf die Disziplin oder Verein beziehen gelöscht werden müssten

      // Disziplinen aktualisieren
      // const deleteDisziplinStmt = dbController.prepare(
      //   `DELETE FROM sportfest_disziplin WHERE sportfest_id = ?`
      // );

      // deleteDisziplinStmt.run(sportfest.id);
      // const insertDisziplinStmt = dbController.prepare(
      //   `INSERT INTO sportfest_disziplin (sportfest_id, disziplin_id) VALUES (?, ?)`
      // );

      // if (sportfest.disziplinen && sportfest.disziplinen.length > 0) {
      //   for (const disziplinId of sportfest.disziplinen) {
      //     insertDisziplinStmt.run(sportfest.id, disziplinId);
      //   }
      // }

      // Vereine aktualisieren
      // const deleteVereinStmt = dbController.prepare(
      //   `DELETE FROM sportfest_verein WHERE sportfest_id = ?`
      // );

      // deleteVereinStmt.run(sportfest.id);
      // const insertVereinStmt = dbController.prepare(
      //   `INSERT INTO sportfest_verein (sportfest_id, verein_id) VALUES (?, ?)`
      // );

      // if (sportfest.vereine && sportfest.vereine.length > 0) {
      //   for (const vereinId of sportfest.vereine) {
      //     insertVereinStmt.run(sportfest.id, vereinId);
      //   }
      // }

      // Admin-Verein aktualisieren
      const deleteAdminStmt = dbController.prepare(
        `DELETE FROM sportfest_adminverein WHERE sportfest_id = ?`
      );

      deleteAdminStmt.run(sportfest.id);
      const insertAdminStmt = dbController.prepare(
        `INSERT INTO sportfest_adminverein (sportfest_id, verein_id) VALUES (?, ?)`
      );

      if (sportfest.adminVerein) {
        insertAdminStmt.run(sportfest.id, sportfest.adminVerein);
      }

      return true;
    } catch (error) {
      logger.error('Fehler beim Bearbeiten des Sportfests:', error);

      throw new Error('Fehler beim Bearbeiten des Sportfests:', error);
    }
  }
}

export default new SportfestController();
