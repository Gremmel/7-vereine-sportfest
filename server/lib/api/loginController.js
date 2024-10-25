/* eslint-disable class-methods-use-this */
import userController from './userController.js';
import logger from '../logger.js';
import bcrypt from 'bcrypt';

class LoginController {
  async verifyPassword (inputPassword, storedHash) {
    try {
      // Vergleicht das eingegebene Passwort mit dem gespeicherten Hash
      const match = await bcrypt.compare(inputPassword, storedHash);

      return match; // true, wenn das Passwort übereinstimmt, ansonsten false
    } catch (error) {
      logger.error('Fehler bei der Passwortüberprüfung:', error);

      return false;
    }
  }

  async loginUser (username, password) {
    const user = userController.getUserByName(username);

    if (user) {
      const isOk = await this.verifyPassword(password, user.password);

      if (isOk) {
        logger.info('erfolgreich', user);

        delete user.password;

        return user;
      }
    }

    return false;
  }
}

export default new LoginController();
