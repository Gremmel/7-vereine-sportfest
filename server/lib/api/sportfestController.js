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
}

export default new SportfestController();
