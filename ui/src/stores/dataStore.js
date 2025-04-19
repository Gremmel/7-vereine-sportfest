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
    editStaffel: null,
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
    setWeitereStaffel (staffelId) {
      this.staffelId= staffelId;
      this.neueStaffel = true;
    },
    setKlasseStaffel (klasseStaffel) {
      this.klasseStaffel = klasseStaffel;
    },
    setEditStaffel (staffel, klasse) {
      this.klasseStaffel = klasse;
      this.staffelVereinsId = staffel.vereinsId;
      this.staffelSportfestId = staffel.sportfestId;
      this.staffelId = staffel.id;
      this.neueStaffel = false;
      this.editStaffel = staffel;
    }
  },
});
