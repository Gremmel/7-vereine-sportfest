<template>
  <div class="container">
    <div class="card mt-2">
      <div class="card-body">
        <div class="row">
          <div class="col">
            <h2 class="card-title">Anmeldung zum  {{ selectedSportfest.name }}</h2>
            <h3 class="card-subtitle mb-2 text-muted">
              <span v-if="selectedSportfest.disziplinActive.dreikampf">Dreikampf</span>
              <span v-if="selectedSportfest.disziplinActive.hochsprung" class="ms-3">Hochsprung</span>
            </h3>
          </div>
          <div v-if="isAdmin" class="col-auto">
            <a :href="`/api/exportDreikampf/${selectedSportfest.id}`" class="btn btn-dark mb-3">Export Anmeldungen</a>
          </div>
          <div v-else class="col-auto">
            <a :href="`/api/exportDreikampf/${selectedSportfest.id}/${userStore.user.verein_id}`" class="btn btn-dark mb-3">Export Anmeldungen</a>
          </div>
        </div>
        <div class="input-group mb-3">
          <input v-model="searchText" type="text" class="form-control" placeholder="finde...">
          <button @click="searchText = '';" class="btn btn-outline-secondary" type="button"
            id="button-addon2">X</button>
        </div>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">
                <span class="sortCollums" @click="clickSortName()">Name</span>
                <i v-if="searchText === '' && sortOrder === 'Name_ASC'" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Name_DSC'" class="bi bi-arrow-up"></i>
              </th>
              <th scope="col">
                <span class="sortCollums" @click="clickSortJahrgang()">Jahrgang (Alter)</span>
                <i v-if="searchText === '' && sortOrder === 'Jahrgang_ASC'" @click="clickSortJahrgang()" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Jahrgang_DSC'" @click="clickSortJahrgang()" class="bi bi-arrow-up"></i>
              </th>
              <th scope="col">
                <span class="sortCollums" @click="clickSortGeschlecht()">Geschlecht</span>
                <i v-if="searchText === '' && sortOrder === 'Geschlecht_ASC'" @click="clickSortGeschlecht()" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Geschlecht_DSC'" @click="clickSortGeschlecht()" class="bi bi-arrow-up"></i>
              </th>
              <th v-if="isAdmin" scope="col">
                <span class="sortCollums" @click="clickSortVerein()">Verein</span>
                <i v-if="searchText === '' && sortOrder === 'Vereinsname_ASC'" @click="clickSortVerein()" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Vereinsname_DSC'" @click="clickSortVerein()" class="bi bi-arrow-up"></i>
              </th>
              <th v-if="selectedSportfest.disziplinActive.dreikampf" scope="col">
                <span class="sortCollums" @click="clickSortDreikampf()">Dreikampf</span>
                <i v-if="searchText === '' && sortOrder === 'Dreikampf_DSC'" @click="clickSortDreikampf()" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Dreikampf_ASC'" @click="clickSortDreikampf()" class="bi bi-arrow-up"></i>
              </th>
              <th v-if="selectedSportfest.disziplinActive.hochsprung" scope="col">
                <span class="sortCollums" @click="clickSortHochsprung()">Hochsprung</span>
                <i v-if="searchText === '' && sortOrder === 'Hochsprung_DSC'" @click="clickSortHochsprung()" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Hochsprung_ASC'" @click="clickSortHochsprung()" class="bi bi-arrow-up"></i>
              </th>

            </tr>
          </thead>
          <tbody>
            <tr v-for="sportler in sportlerListShow" :key="sportler.id">
              <td>{{ sportler.name }} {{ sportler.vname }}</td>
              <td>{{ sportler.jahrgang }} ({{ sportler.alter }})</td>
              <td>{{ sportler.geschlecht === 'm' ? 'männlich' : 'weiblich' }}</td>
              <td v-if="isAdmin">{{ sportler.vereinsname }}</td>
              <td v-if="selectedSportfest.disziplinActive.dreikampf">
                <i
                  v-if="!sportler.dreikampf"
                  @click="clickNewDreikampf(sportler.id)"
                  class="bi bi-x-circle"
                  style="cursor: pointer; font-size: 1.5em;">
                </i>
                <i
                v-if="sportler.dreikampf"
                  @click="clickDelDreikampf(sportler.meldungId)"
                    class="bi bi-check-circle-fill text-success"
                  style="cursor: pointer; font-size: 1.5em;">
                </i>
              </td>
              <td v-if="selectedSportfest.disziplinActive.hochsprung">
                <template v-if ="sportler.dreikampf">
                  <span v-if="sportler.minHoehe === null">min. Alter 10</span>
                  <select v-else v-model="sportler.hoehe" @change="changeStartHoehe(sportler)" class="form-select">
                    <option key="0" value="null">keine Hochsprung Anmeldung</option>
                    <option
                      v-for="item in createHoeheList(sportler.minHoehe)"
                      :key="item.value"
                      :value="item.value"
                    >
                      {{ item.text }}
                    </option>
                  </select>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useDialogStore } from '@/stores/dialogStore';
import Fuse from 'fuse.js';

const sportlerList = reactive([]);
const vereineList = reactive([]);
const userStore = useUserStore();
const dialogStore = useDialogStore();
const router = useRouter();
let sortOrder = ref('Name_ASC');
let fuseSearch;
let searchText = ref('');

const route = useRoute();

const fuseOptions = {
  // isCaseSensitive: false,
  // includeScore: false,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 2,

  // location: 0,
  threshold: 0.3,

  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: [
    'name',
    'vname',
    'jahrgang',
    'vereinsname'
  ]
}

function createHoeheList (minHoehe) {
  let hoeheList = [];

  for (let i = minHoehe; i <= 160; i += 5) {
    hoeheList.push({
      value: i,
      text: `${i} cm`
    });
  }

  return hoeheList;
}

async function clickNewDreikampf (sportlerId) {
  try {
    const response = await fetch('/api/newMeldung', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sportlerId: sportlerId,
        sportfestId: selectedSportfest.value.id
      }),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      for (const sportler of sportlerList) {
        if (sportler.id === sportlerId) {
          sportler.dreikampf = true;
          sportler.meldungId = result.meldungId;
          break;
        }
      }
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 100', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getSportlerList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 101', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

async function clickDelDreikampf (meldungId) {
  try {
    console.log('clickDelDreikamp meldungId', meldungId);
    const response = await fetch('/api/delMeldung', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meldungId
      }),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      for (const sportler of sportlerList) {
        if (sportler.meldungId === meldungId) {
          sportler.dreikampf = false;
          sportler.meldungId = null;
          sportler.hoehe = null;
          break;
        }
      }
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 102', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getSportlerList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 103', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

async function changeStartHoehe (sportler) {
  try {
    const response = await fetch('/api/hoeheMeldung', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        meldungId: sportler.meldungId,
        hoehe: sportler.hoehe
      }),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      for (const sp of sportlerList) {
        if (sp.id === sportler.id) {
          sp.hoehe= sportler.hoehe;
          break;
        }
      }
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 104', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getSportlerList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 105', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

async function getSportlerList (isAdmin) {
  try {
    const vereinsId = userStore.user.verein_id;

    const response = await fetch('/api/getFestSportlerList', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        isAdmin,
        vereinsId,
        sportfestId: selectedSportfest.value.id
      }),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      sportlerList.splice(0);

      for (const sportler of result.sportlerList) {
        sportler.editMode = false;

        if (sportler.alter >= 5) {
          sportlerList.push(sportler);
        }
      }

      fuseSearch = new Fuse(sportlerList, fuseOptions);

    } else if (response.status === 401) {
      // Benutzer aus dem Store entfernen
      await userStore.logout()

      userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

      // weiterleiten zum login
      router.push('/login');
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 106', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getSportlerList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 107', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

async function getVereineList() {
  try {
    let response;
    response = await fetch(`/api/getVereineList`, {
      method: 'GET',
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      vereineList.splice(0);

      for (const vereine of result.vereineList) {
        vereineList.push(vereine);
      }

      getSportlerList(isAdmin.value);

    } else if (response.status === 401) {
      // Benutzer aus dem Store entfernen
      await userStore.logout()

      userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

      // weiterleiten zum login
      router.push('/login');
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 108', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getVereineList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 109', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

function clickSortName() {
  if (searchText.value !== '') {
    return;
  }

  if (sortOrder.value === 'Name_ASC') {
    sortOrder.value = 'Name_DSC';
  } else {
    sortOrder.value = 'Name_ASC';
  }
}

function clickSortJahrgang() {
  if (searchText.value !== '') {
    return;
  }

  if (sortOrder.value === 'Jahrgang_ASC') {
    sortOrder.value = 'Jahrgang_DSC';
  } else {
    sortOrder.value = 'Jahrgang_ASC';
  }
}

function clickSortGeschlecht() {
  if (searchText.value !== '') {
    return;
  }

  if (sortOrder.value === 'Geschlecht_ASC') {
    sortOrder.value = 'Geschlecht_DSC';
  } else {
    sortOrder.value = 'Geschlecht_ASC';
  }
}

function clickSortVerein() {
  if (searchText.value !== '') {
    return;
  }

  if (sortOrder.value === 'Vereinsname_ASC') {
    sortOrder.value = 'Vereinsname_DSC';
  } else {
    sortOrder.value = 'Vereinsname_ASC';
  }
}

function clickSortDreikampf() {
  if (searchText.value !== '') {
    return;
  }

  if (sortOrder.value === 'Dreikampf_ASC') {
    sortOrder.value = 'Dreikampf_DSC';
  } else {
    sortOrder.value = 'Dreikampf_ASC';
  }
}

function clickSortHochsprung() {
  if (searchText.value !== '') {
    return;
  }

  if (sortOrder.value === 'Hochsprung_ASC') {
    sortOrder.value = 'Hochsprung_DSC';
  } else {
    sortOrder.value = 'Hochsprung_ASC';
  }
}

const sportlerListShow = computed(() => {
  if (!sportlerList) {
    return [];
  }

  let sortedList = [];

  if (searchText.value !== '') {
    // globale fuse Filter
    const searchResult = fuseSearch.search(searchText.value);

    for (const obj of searchResult) {
      obj.item.vereinsname = vereineList.find(verein => verein.id === obj.item.vereinsid).name;
      sortedList.push({ ...obj.item });
    }
  } else {
    // Sortierung
    sortedList = sportlerList.map(sportler => ({ ...sportler })); // Erstelle eine tiefe Kopie des Arrays
    for (const sportler of sortedList) {
      sportler.vereinsname = vereineList.find(verein => verein.id === sportler.vereinsid).name;
    }

    if (sortOrder.value === 'Name_ASC') {
      sortedList.sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: 'base' }));
    } else if (sortOrder.value === 'Name_DSC') {
      sortedList.sort((a, b) => b.name.localeCompare(a.name, "de", { sensitivity: "base" }));
    } else if (sortOrder.value === 'Jahrgang_ASC') {
      sortedList.sort((a, b) => a.jahrgang - b.jahrgang);
    } else if (sortOrder.value === 'Jahrgang_DSC') {
      sortedList.sort((a, b) => b.jahrgang - a.jahrgang);
    } else if (sortOrder.value === 'Geschlecht_ASC') {
      sortedList.sort((a, b) => a.geschlecht.localeCompare(b.geschlecht, "de", { sensitivity: 'base' }));
    } else if (sortOrder.value === 'Geschlecht_DSC') {
      sortedList.sort((a, b) => b.geschlecht.localeCompare(a.geschlecht, "de", { sensitivity: "base" }));
    } else if (sortOrder.value === 'Vereinsname_ASC') {
      sortedList.sort((a, b) => a.vereinsname.localeCompare(b.vereinsname, "de", { sensitivity: 'base' }));
    } else if (sortOrder.value === 'Vereinsname_DSC') {
      sortedList.sort((a, b) => b.vereinsname.localeCompare(a.vereinsname, "de", { sensitivity: "base" }));
    } else if (sortOrder.value === 'Dreikampf_ASC') {
      sortedList.sort((a, b) => a.dreikampf - b.dreikampf);
    } else if (sortOrder.value === 'Dreikampf_DSC') {
      sortedList.sort((a, b) => b.dreikampf - a.dreikampf);
    } else if (sortOrder.value === 'Hochsprung_ASC') {
      sortedList.sort((a, b) => {
        if (a.dreikampf === 1 && a.hoehe === null && a.alter > 9) return -1;
        if (b.dreikampf === 1 && b.hoehe === null && b.alter > 9) return 1;
        return 0;
      });
    } else if (sortOrder.value === 'Hochsprung_DSC') {
      sortedList.sort((a, b) => {
        if (a.dreikampf === 1 && a.hoehe != null) return -1;
        if (b.dreikampf === 1 && b.hoehe != null) return 1;
        return 0;
      });
    }

  }

  return sortedList;
});

const isAdmin = computed(() => {
  return userStore.hasRole('admin');
});

const selectedSportfest = computed(() => {
  let found = false;
  let sportfestName = '';
  let disziplinActive = {};

  for (const sportfest of userStore.sportfeste) {
    if (sportfest.id == route.params.sportfestId) {
      found = true;
      sportfestName = sportfest.name;
      disziplinActive = sportfest.disziplinActive;
    }
  }

  if (!found) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    router.push('/');
  }

  return {
    id: route.params.sportfestId,
    name: sportfestName,
    disziplinActive: disziplinActive
  };
});

watch (selectedSportfest, (newVal, oldVal) => {
  if (newVal.id !== oldVal.id) {
    getSportlerList(isAdmin.value);
  }
});

onMounted(() => {
  console.log('onMounted');
  getVereineList();
});
</script>

<style scoped>
.sortCollums {
  cursor: pointer;
}

.editMode {
  color: rgb(187, 187, 187);
}
</style>