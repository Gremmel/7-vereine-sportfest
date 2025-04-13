<template>
  <div class="container">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">Sportfeste</h2>
        <div class="card mb-3">
          <div v-if="showNewSportfestForm" class="card-body">
            <div class="row">
              <div class="col">
                <div class="form-floating mb-3">
                  <input v-model="newSportfest.name" id="floatingInputName" placeholder="Name" type="text" class="form-control">
                  <label for="floatingInputName">Festname</label>
                </div>
              </div>
              <div class="col">
                <div class="form-floating mb-3">
                  <input v-model="newSportfest.ort" id="floatingInputOrt" placeholder="Veranstaltungs Ort" type="text" class="form-control">
                  <label for="floatingInputOrt">Veranstaltungs Ort</label>
                </div>
              </div>
              <div class="col">
                <div class="form-floating mb-3">
                  <input v-model="newSportfest.startdate" id="floatingInputStartdate" type="date" class="form-control">
                  <label for="floatingInputStartdate">Austragungs Datum</label>
                </div>
              </div>
              <div class="col">
                <div class="form-floating mb-3">
                  <input v-model="newSportfest.meldeende" id="floatingInputMeldeende" type="date" class="form-control">
                  <label for="floatingInputMeldeende">Melde Ende</label>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div class="form-floating">
                  <select
                    id="floatingInputDisziplinen"
                    v-model="selectedDisziplinen"
                    multiple size="3"
                    class="form-select"
                    style="height: auto;"
                  >
                    <option v-for="disziplin in disziplinenList" :key="disziplin.id" :value="disziplin.dtyp">
                      {{ disziplin.name }}
                    </option>
                  </select>
                  <label for="floatingInputDisziplinen">Disziplinen</label>
                </div>
              </div>
              <div class="col">
                <div class="form-floating">
                  <select
                    id="floatingInputVereine"
                    v-model="selectedVereine"
                    multiple size="7"
                    class="form-select"
                    style="height: auto;"
                  >
                    <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">
                      {{ verein.name }}
                    </option>
                  </select>
                  <label for="floatingInputVereine">Beteiligte Vereine</label>
                </div>
              </div>
              <div class="col d-flex flex-column">
                <div class="form-floating">
                  <select
                    id="floatingInputAdminVerein"
                    v-model="selectedAdminVerein"
                    class="form-select"
                    style="height: auto;"
                  >
                    <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">
                      {{ verein.name }}
                    </option>
                  </select>
                  <label for="floatingInputAdminVerein">Administrativer Verein</label>
                </div>
                <button v-if="!abgesendetOK"
                  :disabled="!newSportfestValid"
                  type="button"
                  @click="clickNewSportfest"
                  class="btn btn-success mt-auto"
                >
                  Neues Sportfest anlegen
                </button>
                <div v-else>
                  <i class="bi bi-check-circle-fill" style="color: green; font-size: 2rem;"></i>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col">
                <div v-if="hinweisNewSportfest" class="alert alert-danger mt-3" role="alert">
                  {{ hinweisNewSportfest }}
                </div>
              </div>
            </div>
          </div>
          <div v-else class="card-body">
            <button @click="showNewSportfestForm = true" type="button" class="btn btn-success">
              Neues Sportfest anlegen
            </button>
          </div>
        </div>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">
                <span>Name</span>
              </th>
              <th scope="col">
                <span>Ort</span>
              </th>
              <th scope="col">
                Start Datum
              </th>
              <th scope="col">
                Meldeschluss
              </th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="sportfest in sportfestListShow" :key="sportfest.id">
              <!-- Anzeige Mode -->
              <template v-if="!sportfest.editMode">
                <tr>
                  <td :class="{ 'editMode': editMode }">{{ sportfest.name }}</td>
                  <td :class="{ 'editMode': editMode }">{{ sportfest.ort }}</td>
                  <td :class="{ 'editMode': editMode }">{{ new Date(sportfest.startdate).toLocaleDateString() }}</td>
                  <td :class="{ 'editMode': editMode }">{{ new Date(sportfest.meldeende).toLocaleDateString() }}</td>
                  <td>
                    <div class="d-flex">
                      <button v-if="!editMode"  @click="clickDelSportfest(sportfest)" type="button" class="btn btn-danger">
                        <i class="bi bi-trash"></i>
                      </button>
                      <button v-if="!editMode" @click="clickEditSportfest(sportfest)" class="btn btn-primary ms-1">
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
              <!-- Edit Mode -->
              <template v-else>
                <tr>
                  <td><input v-model="sportfest.name" type="text" class="form-control"></td>
                  <td><input v-model="sportfest.ort" type="text" class="form-control"></td>
                  <td><input v-model="sportfest.startdate" type="date" class="form-control"></td>
                  <td><input v-model="sportfest.meldeende" type="date" class="form-control"></td>
                  <td>
                    <button @click="clickEditSportfestAbbrechen(sportfest)" type="button" class="btn btn-secondary">
                      <i class="bi bi-x"></i>
                    </button>
                    <button @click="clickEditSportfestAendern(sportfest)" class="btn btn-success ms-1">
                      <i class="bi bi-check"></i>
                    </button>
                  </td>
                </tr>
                <tr>
                  <td colspan="5">
                    <!-- erweiterte Elemente -->
                    <div class="row">
                      <div class="col">
                        <div class="form-floating">
                          <select
                            id="floatingInputDisziplinen"
                            v-model="sportfest.disziplinen"
                            multiple size="3"
                            class="form-select"
                            style="height: auto;"
                            disabled
                          >
                            <option v-for="disziplin in disziplinenList" :key="disziplin.id" :value="disziplin.dtyp">
                              {{ disziplin.name }}
                            </option>
                          </select>
                          <label for="floatingInputDisziplinen">Disziplinen</label>
                        </div>
                      </div>
                      <div class="col">
                        <div class="form-floating">
                          <select
                            id="floatingInputVereine"
                            v-model="sportfest.vereine"
                            multiple size="7"
                            class="form-select"
                            style="height: auto;"
                            disabled
                          >
                            <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">
                              {{ verein.name }}
                            </option>
                          </select>
                          <label for="floatingInputVereine">Beteiligte Vereine</label>
                        </div>
                      </div>
                      <div class="col d-flex flex-column">
                        <div class="form-floating">
                          <select
                            id="floatingInputAdminVerein"
                            v-model="sportfest.adminVerein"
                            class="form-select"
                            style="height: auto;"
                          >
                            <option v-for="verein in vereineList" :key="verein.id" :value="verein.id">
                              {{ verein.name }}
                            </option>
                          </select>
                          <label for="floatingInputAdminVerein">Administrativer Verein</label>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useDataStore } from '@/stores/dataStore';
import { useDialogStore } from '@/stores/dialogStore';

const sportfestList = reactive([]);
const disziplinenList = reactive([]);
const selectedDisziplinen = ref([]);
const selectedVereine = ref([]);
const selectedAdminVerein = ref(null);
const vereineList = reactive([]);
const userStore = useUserStore();
const dataStore = useDataStore();
const dialogStore = useDialogStore();
const router = useRouter();
const showNewSportfestForm = ref(false);
const newSportfest = ref({
  name: '',
  ort: '',
  startdate: '',
  meldeende: ''
});
const abgesendetOK = ref(false);
let delSportfestId = null;
const editMode = ref(false);

async function getSportfestList() {
  try {
    let response;

    response = await fetch(`/api/getSportfestList`, {
      method: 'GET',
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      sportfestList.splice(0);
      disziplinenList.splice(0);

      for (const sportfest of result.sportfestList) {
        sportfest.editMode = false;
        sportfest.startdate = sportfest.startdate ? new Date(sportfest.startdate).toISOString().split('T')[0] : '';
        sportfest.meldeende = sportfest.meldeende ? new Date(sportfest.meldeende).toISOString().split('T')[0] : '';
        sportfestList.push(sportfest);
      }

      for (const disziplin of result.disziplinenList) {
        disziplinenList.push(disziplin);
      }

    } else if (response.status === 401) {
      // Benutzer aus dem Store entfernen
      await userStore.logout()

      userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

      // weiterleiten zum login
      router.push('/login');
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getSportfestList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

function clickEditSportfest(sportfest) {
  for (const sportfestOrg of sportfestList) {
    if (sportfestOrg.id === sportfest.id) {
      sportfestOrg.editMode = true;
      break;
    }
  }
  showNewSportfestForm.value = false;
  editMode.value = true;
}

function clickDelSportfest(sportfest) {
  console.log('asdf  delSportfestId', delSportfestId);
  delSportfestId = sportfest.id;
  dialogStore.setParameter(
    'Sportfest löschen',
    `Wollen Sie das Sportfest <b>${sportfest.name}</b> wirklich löschen?<br><br><b>Achtung</b>: Alle Meldungen für dieses Sportfest werden ebenfalls gelöscht!`,
    'Löschen',
    'btn-danger',
    'Abbrechen',
    null,
    resDialogDelSportfest
  );
}

const resDialogDelSportfest = async () => {
  console.log('delSportfest');
  await delSportfest();
}

const clickEditSportfestAendern = async (sportfest) => {
  try {
    const response = await fetch('/api/editSportfest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sportfest }),
      credentials: 'include'  // Cookies mitsenden
    });

    if (response.ok) {
      for (const sportfestOrg of sportfestList) {
        if (sportfestOrg.id === sportfest.id) {
          sportfestOrg.name = sportfest.name;
          sportfestOrg.ort = sportfest.ort;
          sportfestOrg.startdate = sportfest.startdate;
          sportfestOrg.meldeende = sportfest.meldeende;
          sportfestOrg.editMode = false;
          break;
        }
      }

      editMode.value = false;
      dataStore.sportfesteChanged = true;
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);

    }
  } catch (error) {
    console.error('Es gab ein Problem beim Aendern des Sportfestes', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

const clickEditSportfestAbbrechen = (sportfest) => {
  for (const sportfestOrg of sportfestList) {
    if (sportfestOrg.id === sportfest.id) {
      sportfestOrg.editMode = false;
      break;
    }
  }
  editMode.value = false;
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

      getSportfestList();

    } else if (response.status === 401) {
      // Benutzer aus dem Store entfernen
      await userStore.logout()

      userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

      // weiterleiten zum login
      router.push('/login');
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getVereineList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

async function delSportfest() {
  console.log('delSportfest delSportfestId', delSportfestId);
  try {
    const response = await fetch('/api/delSportfest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ delSportfestId }),
      credentials: 'include'  // Cookies mitsenden
    });

    if (response.ok) {
      for (let index = 0; index < sportfestList.length; index++) {
        if (delSportfestId === sportfestList[index].id) {
          sportfestList.splice(index, 1);
          break;
        }
      }

      dataStore.sportfesteChanged = true;
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
    }
  } catch (error) {
    console.error('Es gab ein Problem mit Löschen des Sportfestes:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

const newSportfestValid = computed(() => {
  return newSportfest.value.name !== '' &&
    newSportfest.value.name !== '' &&
    newSportfest.value.ort !== '' &&
    newSportfest.value.startdate &&
    newSportfest.value.meldeende &&
    newSportfest.value.startdate > newSportfest.value.meldeende &&
    selectedVereine.value.length > 0 &&
    selectedAdminVerein.value !== null &&
    selectedDisziplinen.value.length > 0;
});

const hinweisNewSportfest = computed(() => {
  if (!newSportfest.value.name) {
    return 'Bitte den Festnamen eintragen';
  } else if (!newSportfest.value.ort) {
    return 'Bitte den Veranstaltungsort eintragen';
  } else if (!newSportfest.value.startdate) {
    return 'Bitte das Austragungs Datum eintragen';
  } else if (!newSportfest.value.meldeende) {
    return 'Bitte das Meldeschlussdatum eintragen';
  } else if (newSportfest.value.startdate < newSportfest.value.meldeende) {
    return 'Das Austragungs Datum muss nach dem Meldeschlussdatum liegen';
  } else if (selectedVereine.value.length === 0) {
    return 'Bitte mindestens einen Verein auswählen';
  } else if (selectedAdminVerein.value === null) {
    return 'Bitte den administrativen Verein auswählen';
  } else if (selectedDisziplinen.value.length === 0) {
    return 'Bitte mindestens eine Disziplin auswählen';
  }
  return '';
});

const sportfestListShow = computed(() => {
  if (!sportfestList) {
    return [];
  }

  return sportfestList;
});


const clickNewSportfest = async () => {
  console.log('clickNewSportfest', newSportfest.value);
  const kopieNewSporfest = { ...newSportfest.value };
  newSportfest.value.name = '';
  newSportfest.value.ort = '';
  newSportfest.value.startdate = '';
  newSportfest.value.meldeende = '';
  kopieNewSporfest.disziplinen = selectedDisziplinen.value;
  kopieNewSporfest.vereine = selectedVereine.value;
  kopieNewSporfest.adminVerein = selectedAdminVerein.value;
  selectedDisziplinen.value = [];
  selectedVereine.value = [];
  selectedAdminVerein.value = null;
  console.log('clickNewSportfest kopieNewSporfest', kopieNewSporfest);

  try {
    const response = await fetch('/api/newSportfest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sportfest: kopieNewSporfest }),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok && result.sportfestId > 0) {
      abgesendetOK.value = true;
      showNewSportfestForm.value = false;

      setTimeout(() => {
        abgesendetOK.value = false;
      }, 2000);

      sportfestList.push({
        id: result.sportfestId,
        name: kopieNewSporfest.name,
        ort: kopieNewSporfest.ort,
        startdate: kopieNewSporfest.startdate,
        meldeende: kopieNewSporfest.meldeende,
        disziplinen: kopieNewSporfest.disziplinen,
        vereine: kopieNewSporfest.vereine,
        adminVerein: kopieNewSporfest.adminVerein,
        editMode: false
      });

      dataStore.sportfesteChanged = true;
    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log('fehler status beim anlegegen des Sportfestes', response.status);

    }
  } catch (error) {
    console.error('Es gab ein Problem beim Anlegen des Sportfestes', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);

  }
};

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