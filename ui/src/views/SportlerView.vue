<template>
  <div class="container">
    <div class="card mt-2">
      <div class="card-body">
        <h2 class="card-title">Teilnehmer</h2>
        <div class="input-group mb-3">
          <input v-model="searchText" type="text" class="form-control" placeholder="finde...">
          <button @click="clickClearTextSearch()" class="btn btn-outline-secondary" type="button"
            id="button-addon2">X</button>
        </div>

        <!-- Ansicht PC -->
        <table v-if="!userStore.isMobileDevice" class="table table-striped">
          <thead>
            <tr>
              <th scope="col">
                <span class="sortCollums" @click="clickSortName()">Name</span>
                <i v-if="searchText === '' && sortOrder === 'Name_ASC'" @click="clickSortName()" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Name_DSC'" @click="clickSortName()" class="bi bi-arrow-up"></i>
              </th>
              <th scope="col">
                <span class="sortCollums" @click="clickSortVorname()">Vorname</span>
                <i v-if="searchText === '' && sortOrder === 'Vorname_ASC'" @click="clickSortVorname()" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Vorname_DSC'" @click="clickSortVorname()" class="bi bi-arrow-up"></i>
              </th>
              <th scope="col">
                <span class="sortCollums" @click="clickSortJahrgang()">Jahrgang</span>
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
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input v-model="newSportler.name" type="text" class="form-control"></td>
              <td><input v-model="newSportler.vname" type="text" class="form-control"></td>
              <td><input v-model.number="newSportler.jahrgang" type="number" class="form-control" min="1900"></td>
              <td>
                <select v-model="newSportler.geschlecht" class="form-select">
                  <option value="m">männlich</option>
                  <option value="w">weiblich</option>
                </select>
              </td>
              <td v-if="isAdmin">
                <select v-model="newSportler.vereinsid" class="form-select">
                  <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">
                    {{ verein.name }}
                  </option>
                </select>
              </td>
              <td>
                <button v-if="!abgesendetOK" :disabled="!newSportlerValid" type="button" @click="clickNewSportler"
                  class="btn btn-success">
                  Neuer Sportler
                </button>
                <div v-else>
                  <i class="bi bi-check-circle-fill" style="color: green; font-size: 2rem;"></i>
                </div>
              </td>
            </tr>
            <tr v-for="sportler in sportlerListShow" :key="sportler.id">
              <template v-if="!sportler.editMode">
                <td :class="{ 'editMode': editMode }">{{ sportler.name }}</td>
                <td :class="{ 'editMode': editMode }">{{ sportler.vname }}</td>
                <td :class="{ 'editMode': editMode }">{{ sportler.jahrgang }}</td>
                <td :class="{ 'editMode': editMode }">{{ sportler.geschlecht === 'm' ? 'männlich' : 'weiblich' }}</td>
                <td :class="{ 'editMode': editMode }" v-if="isAdmin">{{ sportler.vereinsname }}</td>
                <td>
                  <div class="d-flex">
                    <button v-if="!editMode" @click="clickDelSportler(sportler)" type="button" class="btn btn-danger">
                      <i class="bi bi-trash"></i>
                    </button>
                    <button v-if="!editMode" @click="clickEditSportler(sportler)" class="btn btn-primary ms-1">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </template>
              <template v-else>
                <td><input v-model="sportler.name" type="text" class="form-control"></td>
                <td><input v-model="sportler.vname" type="text" class="form-control"></td>
                <td><input v-model.number="sportler.jahrgang" type="number" class="form-control" min="1900"></td>
                <td>
                  <select v-model="sportler.geschlecht" class="form-select">
                    <option value="m">männlich</option>
                    <option value="w">weiblich</option>
                  </select>
                </td>
                <td v-if="isAdmin">
                  <select v-model="sportler.vereinsid" class="form-select">
                    <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">{{ verein.name }}</option>
                  </select>
                </td>
                <td>
                  <button @click="clickEditSportlerAbbrechen(sportler)" type="button" class="btn btn-secondary">
                    <i class="bi bi-x"></i>
                  </button>
                  <button @click="clickEditSportlerAendern(sportler)" class="btn btn-success ms-1">
                    <i class="bi bi-check"></i>
                  </button>
                </td>
              </template>
            </tr>
          </tbody>
        </table>

        <!-- Mobile Ansicht -->
        <div v-if="userStore.isMobileDevice" class="list-group">
          <!-- Neuer Sportler -->
          <div class="card-body">
            <h6 class="card-title">Neuer Sportler</h6>
            <div class="mb-1">
                <label for="name" class="form-label" style="font-size: 0.9rem;">Name</label>
              <input id="name" v-model="newSportler.name" type="text" class="form-control form-control-sm" placeholder="Name">
            </div>
            <div class="mb-1">
              <label for="vname" class="form-label" style="font-size: 0.9rem;">Vorname</label>
              <input id="vname" v-model="newSportler.vname" type="text" class="form-control form-control-sm" placeholder="Vorname">
            </div>
            <div class="mb-1">
              <label for="jahrgang" class="form-label" style="font-size: 0.9rem;">Jahrgang</label>
              <input id="jahrgang" v-model.number="newSportler.jahrgang" type="number" class="form-control form-control-sm" min="1900" placeholder="Jahrgang">
            </div>
            <div class="mb-1">
              <label for="geschlecht" class="form-label" style="font-size: 0.9rem;">Geschlecht</label>
              <select id="geschlecht" v-model="newSportler.geschlecht" class="form-select form-select-sm">
                <option value="m">männlich</option>
                <option value="w">weiblich</option>
              </select>
            </div>
            <div v-if="isAdmin" class="mb-1">
              <label for="verein" class="form-label" style="font-size: 0.9rem;">Verein</label>
              <select id="verein" v-model="newSportler.vereinsid" class="form-select form-select-sm">
                <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">
                  {{ verein.name }}
                </option>
              </select>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button v-if="!abgesendetOK" :disabled="!newSportlerValid" type="button" @click="clickNewSportler" class="btn btn-sm btn-success w-100">
                Neuer Sportler
              </button>
              <div v-else>
                <i class="bi bi-check-circle-fill" style="color: green; font-size: 2rem;"></i>
              </div>
            </div>
          </div>
          <!-- Auflistung der Sportler -->
          <div v-for="sportler in sportlerListShow" :key="sportler.id" class="list-group-item">
            <template v-if="!sportler.editMode">
              <div :class="{ 'editMode': editMode }">
                <div class="d-flex justify-content-between">
                  <div>
                    <strong>{{ sportler.name }}</strong> {{ sportler.vname }}
                  </div>
                  <div v-if="!editMode">
                    <button @click="clickDelSportler(sportler)" class="btn btn-danger btn-sm">
                      <i class="bi bi-trash"></i>
                    </button>
                    <button @click="clickEditSportler(sportler)" class="btn btn-primary btn-sm ms-1">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <small>Jahrgang: {{ sportler.jahrgang }}</small>
                </div>
                <div>
                  <small>Geschlecht: {{ sportler.geschlecht === 'm' ? 'männlich' : 'weiblich' }}</small>
                </div>
                <div v-if="isAdmin">
                  <small>Verein: {{ sportler.vereinsname }}</small>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="mb-1">
                <label for="name" class="form-label" style="font-size: 0.9rem;">Name</label>
                <input id="name" v-model="sportler.name" type="text" class="form-control form-control-sm">
              </div>
              <div class="mb-1">
                <label for="vname" class="form-label" style="font-size: 0.9rem;">Vorname</label>
                <input id="vname" v-model="sportler.vname" type="text" class="form-control form-control-sm">
              </div>
              <div class="mb-1">
                <label for="jahrgang" class="form-label" style="font-size: 0.9rem;">Jahrgang</label>
                <input id="jahrgang" v-model.number="sportler.jahrgang" type="number" class="form-control form-control-sm" min="1900">
              </div>
              <div class="mb-1">
                <label for="geschlecht" class="form-label" style="font-size: 0.9rem;">Geschlecht</label>
                <select id="geschlecht" v-model="sportler.geschlecht" class="form-select form-select-sm">
                  <option value="m">männlich</option>
                  <option value="w">weiblich</option>
                </select>
              </div>
              <div v-if="isAdmin" class="mb-1">
                <label for="verein" class="form-label" style="font-size: 0.9rem;">Verein</label>
                <select id="verein" v-model="sportler.vereinsid" class="form-select form-select-sm">
                  <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">
                    {{ verein.name }}
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-between">
                <button @click="clickEditSportlerAbbrechen(sportler)" class="btn btn-secondary btn-sm">
                  <i class="bi bi-x"></i> Abbrechen
                </button>
                <button @click="clickEditSportlerAendern(sportler)" class="btn btn-success btn-sm ms-1">
                  <i class="bi bi-check"></i> Speichern
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
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
const newSportler = ref({
  name: '',
  vname: '',
  jahrgang: '',
  geschlecht: '',
  vereinsid: ''
});
const abgesendetOK = ref(false);
const editMode = ref(false);
let delSportlerId = null;

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

function clickClearTextSearch() {
  searchText.value = '';
}

async function getSportlerList(isAdmin) {
  try {
    const vereinsID = userStore.user.verein_id;
    let response;

    if (isAdmin) {
      response = await fetch(`/api/getSportlerList`, {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });
    } else {
      response = await fetch(`/api/getSportlerList/${vereinsID}`, {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });
    }

    const result = await response.json();

    if (response.ok) {
      sportlerList.splice(0);

      for (const sportler of result.sportlerList) {
        sportler.editMode = false;
        sportlerList.push(sportler);
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
        dialogStore.setParameter('Fehlercode 142', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getSportlerList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 143', `${error.message}`, 'ok', null, '', null, null);
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
        dialogStore.setParameter('Fehlercode 144', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getVereineList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 145', `${error.message}`, 'ok', null, '', null, null);
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

function clickSortVorname() {
  if (searchText.value !== '') {
    return;
  }

  if (sortOrder.value === 'Vorname_ASC') {
    sortOrder.value = 'Vorname_DSC';
  } else {
    sortOrder.value = 'Vorname_ASC';
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

function clickEditSportler(sportler) {
  for (const sportlerOrg of sportlerList) {
    if (sportlerOrg.id === sportler.id) {
      sportlerOrg.editMode = true;
      break;
    }
  }
  editMode.value = true;
}

async function delSportler() {
  console.log('delSportler delSportlerId', delSportlerId);
  try {
    const response = await fetch('/api/delSportler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ delSportlerId }),
      credentials: 'include'  // Cookies mitsenden
    });

    if (response.ok) {
      for (let index = 0; index < sportlerList.length; index++) {
        if (delSportlerId === sportlerList[index].id) {
          sportlerList.splice(index, 1);
          break;
        }
      }
      fuseSearch = new Fuse(sportlerList, fuseOptions);
    } else {
      console.log('asdf test response', response);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 146', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
    }
  } catch (error) {
    console.error('Es gab ein Problem mit Löschen des Sportlers:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 147', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

function clickDelSportler(sportler) {
  delSportlerId = sportler.id;

  dialogStore.setParameter(
    'Löschen',
    `Den Sportler <span class="fw-bold">${sportler.name} ${sportler.vname}</span> wirklich löschen?`,
    'Löschen',
    'btn-danger',
    'Abbrechen',
    null,
    delSportler
  );
}

function checkNewSportlerDoppelt(newSportler, isAdmin) {
  for (const sportler of sportlerList) {
    if (sportler.name.toLowerCase() === newSportler.name.toLowerCase() &&
      sportler.vname.toLowerCase() === newSportler.vname.toLowerCase() &&
      sportler.jahrgang === newSportler.jahrgang &&
      sportler.geschlecht === newSportler.geschlecht) {
      if (sportler.vereinsid === newSportler.vereinsid && isAdmin || !isAdmin) {
        return true;
      }
    }
  }

  return false;
}

const newSportlerValid = computed(() => {
  if (isAdmin.value) {
    return newSportler.value.name !== '' &&
      newSportler.value.vname !== '' &&
      newSportler.value.jahrgang !== '' &&
      newSportler.value.jahrgang > 1900 &&
      newSportler.value.geschlecht !== '' &&
      newSportler.value.vereinsid !== '' &&
      checkNewSportlerDoppelt(newSportler.value, isAdmin.value) === false;
  } else {
    return newSportler.value.name !== '' &&
      newSportler.value.vname !== '' &&
      newSportler.value.jahrgang !== '' &&
      newSportler.value.jahrgang > 1900 &&
      newSportler.value.geschlecht !== '' &&
      checkNewSportlerDoppelt(newSportler.value, isAdmin.value) === false;
  }
});

const sportlerListShow = computed(() => {
  if (!sportlerList) {
    return [];
  }

  let sortedList = [];

  // Filter nach Neuem Namen
  if (newSportler.value.name !== '') {
    for (const sportler of sportlerList) {
      console.log('sportler newSportler', newSportler);
      if (sportler.name.toLowerCase().startsWith(newSportler.value.name.toLowerCase())) {
        const obj = { ...sportler };

        obj.vereinsname = vereineList.find(verein => verein.id === obj.vereinsid).name;
        sortedList.push(obj);
      }
    }
  } else if (searchText.value !== '') {
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
    } else if (sortOrder.value === 'Vorname_ASC') {
      sortedList.sort((a, b) => a.vname.localeCompare(b.vname, "de", { sensitivity: 'base' }));
    } else if (sortOrder.value === 'Vorname_DSC') {
      sortedList.sort((a, b) => b.vname.localeCompare(a.vname, "de", { sensitivity: "base" }));
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
    }
  }

  return sortedList;
});


const clickNewSportler = async () => {
  console.log('clickNewSportler', newSportler.value);
  const kopieNewSportler = { ...newSportler.value };
  newSportler.value.name = '';
  newSportler.value.vname = '';
  newSportler.value.jahrgang = '';
  newSportler.value.geschlecht = '';
  newSportler.value.vereinsid = '';

  if (!isAdmin.value) {
    kopieNewSportler.vereinsid = userStore.user.verein_id;
  }

  try {
    const response = await fetch('/api/newsportler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(kopieNewSportler),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok && result.sportlerId > 0) {
      abgesendetOK.value = true;

      setTimeout(() => {
        abgesendetOK.value = false;
      }, 2000);

      sportlerList.push({
        id: result.sportlerId,
        name: kopieNewSportler.name,
        vname: kopieNewSportler.vname,
        jahrgang: kopieNewSportler.jahrgang,
        geschlecht: kopieNewSportler.geschlecht,
        vereinsid: kopieNewSportler.vereinsid
      });

      fuseSearch = new Fuse(sportlerList, fuseOptions);
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 148', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log('fehler status beim anlegegen des sportlers', response.status);

    }
  } catch (error) {
    console.error('Es gab ein Problem beim Anlegen des Sportlers', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 149', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);

  }
};
const clickEditSportlerAendern = async (sportler) => {
  try {
    const response = await fetch('/api/editsportler', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sportler),
      credentials: 'include'  // Cookies mitsenden
    });

    await response.json();

    if (response.ok) {
      for (const sportlerOrg of sportlerList) {
        if (sportlerOrg.id === sportler.id) {
          sportlerOrg.name = sportler.name;
          sportlerOrg.vname = sportler.vname;
          sportlerOrg.jahrgang = sportler.jahrgang;
          sportlerOrg.geschlecht = sportler.geschlecht;
          sportlerOrg.vereinsid = sportler.vereinsid;
          sportlerOrg.editMode = false;
          break;
        }
      }
      fuseSearch = new Fuse(sportlerList, fuseOptions);

      editMode.value = false;
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 150', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);

    }
  } catch (error) {
    console.error('Es gab ein Problem beim Aendern des Sportlers', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 151', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

const clickEditSportlerAbbrechen = (sportler) => {
  for (const sportlerOrg of sportlerList) {
    if (sportlerOrg.id === sportler.id) {
      sportlerOrg.editMode = false;
      break;
    }
  }
  editMode.value = false;
}

const isAdmin = computed(() => {
  return userStore.hasRole('admin');
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