/* eslint-disable class-methods-use-this */
// userController.mjs
import dbController from './dbController.js';
import logger from '../logger.js';
import bcrypt from 'bcrypt';

class UserController {
  getUsers () {
    try {
      const stmt = dbController.prepare('SELECT * FROM fos_user ORDER BY username COLLATE NOCASE');
      const users = stmt.all();

      // passwort hash entfernen
      for (const user of users) {
        delete user.password;
      }

      // Vereins ID und Name hinzufügen
      for (const user of users) {
        const stmt2 = dbController.prepare('SELECT verein.id as vereinsId, verein.name as vereinName, verein.logo as vereinLogo FROM user_verein LEFT JOIN verein ON user_verein.verein_id=verein.id WHERE user_verein.user_id=?');
        const vereine = stmt2.all(user.id);

        if (vereine.length > 0) {
          user.verein = vereine[0];
        } else {
          user.verein = [];
        }
      }

      return users;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Benutzer:', error);

      throw new Error('Konnte die Benutzer nicht abrufen.');
    }
  }

  getUserByName (username) {
    try {
      const stmt = dbController.prepare(`SELECT fos_user.id as id, fos_user.password as password, fos_user.username as username, fos_user.email as email, fos_user.enabled as enabled, fos_user.roles as roles,verein.id as verein_id, verein.name as verein_name, verein.logo as verein_logo FROM fos_user LEFT JOIN user_verein ON user_verein.user_id=fos_user.id LEFT JOIN verein ON verein.id= user_verein.verein_id WHERE username ='${username}' COLLATE NOCASE`);
      const user = stmt.get();

      return user;
    } catch (error) {
      logger.error('Fehler beim Abrufen der Benutzer:', error);

      throw new Error('Konnte die Benutzer nicht abrufen.');
    }
  }

  async hashPassword (password) {
    const saltRounds = 13; // Je höher die Zahl, desto sicherer, aber langsamer

    try {
      const hash = await bcrypt.hash(password, saltRounds);

      return hash; // Gibt den erzeugten Hash zurück
    } catch (error) {
      logger.error('Fehler beim Erzeugen des Passwort-Hashes:', error);
      throw error; // Fehler weiterleiten, damit der Aufrufer ihn behandeln kann
    }
  }

  async addUser (user) {
    const { username, email, telefon, password, roles, enabled, vereinsId } = user;

    const passHash = await this.hashPassword(password);

    const stmt = dbController.prepare(`
      INSERT INTO fos_user (username, email, telefon, password, roles, enabled)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      const info = stmt.run(username, email, telefon, passHash, roles, enabled);

      logger.info(`User ${username} added successfully.`);

      // Hole die ID des neu hinzugefügten Benutzers
      const userId = info.lastInsertRowid;

      logger.info(`New user ID: ${userId}`);

      // Füge den Benutzer in die user_verein-Tabelle ein
      const stmt2 = dbController.prepare(`
        INSERT INTO user_verein (user_id, verein_id)
        VALUES (?, ?)
      `);

      stmt2.run(userId, vereinsId);
      logger.info(`User ${username} added to user_verein successfully.`);

      return true;
    } catch (error) {
      logger.error(`Error adding user: ${error.message}`);

      return false;
    }
  }

  async updateUser (user) {
    const { id, username, email, telefon, password, roles, enabled, vereinsId } = user;

    let passHash = null;

    if (password) {
      passHash = await this.hashPassword(password);
      logger.info('updated hash', passHash);
    }

    const stmt = dbController.prepare(`
      UPDATE fos_user
      SET username = ?, email = ?, telefon = ?, password = COALESCE(?, password), roles = ?, enabled = ?
      WHERE id = ?
    `);

    try {
      const result = stmt.run(username, email, telefon, passHash, roles, enabled, id);

      logger.info(`User ${username} updated successfully.`, result);

      if (result.changes === 1) {
        // führe die Aktualisierung der user_verein-Tabelle aus
        const stmt2 = dbController.prepare(`
          UPDATE user_verein
          SET verein_id = ?
          WHERE user_id = ?
        `);

        stmt2.run(vereinsId, id);
        logger.info(`User ${username} updated in user_verein successfully.`);

        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);

      return false;
    }
  }

  async changePassword (user) {
    const { id, password } = user;

    let passHash = null;

    if (password) {
      passHash = await this.hashPassword(password);
      logger.info('updated hash', passHash);
    }

    const stmt = dbController.prepare(`
      UPDATE fos_user
      SET password = COALESCE(?, password)
      WHERE id = ?
    `);

    try {
      const result = stmt.run(passHash, id);

      logger.info(`Password changed successfully.`, result);

      if (result.changes === 1) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Error changing password: ${error.message}`);

      return false;
    }
  }

  async delUser (user) {
    const { id } = user;

    if (!id) {
      return false;
    }

    // Verwende Platzhalter für eine sichere SQL-Abfrage
    const stmt = dbController.prepare(`DELETE FROM fos_user WHERE id = ?`);

    try {
      const result = stmt.run(id);

      if (result.changes === 1) {
        logger.info(`User ${id} erfolgreich gelöscht.`, result);

        return true;
      }

      return false;
    } catch (error) {
      logger.error(`Error adding user: ${error.message}`);

      return false;
    }
  }
}

export default new UserController();
