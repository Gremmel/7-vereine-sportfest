// src/stores/userStore.js
import { defineStore } from 'pinia';

export const useDataStore = defineStore('dataStore', {
  state: () => ({
    klasseStaffel: null,
    neueStaffel: null,
    staffelVereinsId: null,
    staffelSportfestId: null,
  }),

  getters: {
    getKlasseStaffel: (state) => state.klasseStaffel
  },

  actions: {
    setNeueStaffel (klasse, vereinsId, sportfestId) {
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
