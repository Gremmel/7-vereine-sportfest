// src/stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null,
    editUser: null,
    message: null,
    getSessionDataFinished: false,
    sportfeste: null,
    selectedSportfest: null,
    lastSelectedStaffelVereinsId: null,
    isMobile: false,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
    isMobileDevice: (state) => state.isMobile,
  },

  actions: {
    setMessage (message) {
      this.message = message;
    },

    setUser (userData) {
      this.user = userData;
      this.getSessionDataFinished = true;
    },

    setIsMobile(isMobile) {
      this.isMobile = isMobile; // Methode zum Setzen von isMobile
    },

    setEditUser (user) {
      this.editUser = user;
    },

    clearUser () {
      this.user = null;
    },

    clearEditUser () {
      this.editUser = null;
    },

    hasRole (role) {
      if (this.user) {
        return this.user.roles.includes(role);
      }

      return false;
    },

    // Benutzer abmelden
    async logout () {
      console.log('doLogout');

      // Benutzer aus dem Store entfernen
      this.clearUser();

      // Beim Server abmelden
      try {
        const response = await fetch('/api/logout', {
          method: 'GET',
          credentials: 'include'  // Cookies mitsenden
        });

        const result = await response.json();
        console.log('doLogout response', response);

        if (response.ok) {
          console.log('logout IO');
        } else {
          console.error(result.message || 'Login fehlgeschlagen');
        }
      } catch (error) {
        console.error('Es gab ein Problem mit dem Abmelden beim Server:', error);
      }
    }
  },
});
