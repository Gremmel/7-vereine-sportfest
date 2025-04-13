// src/stores/userStore.js
import { defineStore } from 'pinia';

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    klasseStaffel: null,
    neueStaffel: null,
    staffelVereinsId: null,
    staffelSportfestId: null,
    staffelId: null,
    sportfesteChanged: false,
  }),

  getters: {
    getKlasseStaffel: (state) => state.klasseStaffel
  },

  actions: {
    setNeueStaffel (klasse, vereinsId, sportfestId, staffelId) {
      this.staffelId = staffelId;
      this.klasseStaffel = klasse;
      this.staffelVereinsId = vereinsId;
      this.neueStaffel = true;
      this.staffelSportfestId = sportfestId;
    },
    setKlasseStaffel (klasseStaffel) {
      this.klasseStaffel = klasseStaffel;
    },
  },
});
