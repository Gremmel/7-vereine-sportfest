// src/stores/userStore.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.user,
  },

  actions: {
    setUser(userData) {
      this.user = userData;
    },

    clearUser() {
      this.user = null;
    },
  },
});
