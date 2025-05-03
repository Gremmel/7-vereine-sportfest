<template>
  <div class="container">
    <div class="row mt-2">
      <div class="col">
        <h2>Staffeln {{ selectedSportfest.name }}</h2>
      </div>
      <div v-if="isAdmin" class="col-auto">
        <a :href="`/api/exportStaffel/${selectedSportfest.id}`" class="btn btn-dark mb-3">Export Anmeldungen</a>
      </div>
      <div v-else class="col-auto">
        <a :href="`/api/exportStaffelVerein/${selectedSportfest.id}/${userStore.user.verein_id}`" class="btn btn-dark mb-3">Export Anmeldungen</a>
      </div>
    </div>
    <div v-if="isAdmin" class="d-flex align-items-center mb-3">
      <img :src="`/logos/${selectedVereinLogo}`" alt="" srcset="" class="me-1" style="height: 40px;">
      <label for="vereineSelect" class="form-label me-2">Verein: </label>
      <select v-model="staffelVereinsId" class="form-select" aria-label="Default select example">
        <option v-for="verein of sportfestVereineList" :key="verein.id" :value="verein.id">{{ verein.name }}</option>
      </select>
    </div>
    <div v-for="klasse of klassenList" :key="klasse.id" class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center" style="background-color: #e3e3e3;">
        <h5 class="card-title">{{ klasse.name }}</h5>
        <button class="btn btn-success" @click="clickNeueStaffel(klasse)">Neue Staffel hinzufügen</button>
      </div>
      <div class="card-body">
        <!-- Tabelle Staffeln -->
        <table class="table table-hover table-sm">
          <tbody>
            <tr v-for="(staffel, index) of klasse.staffeln" :key="staffel.id">
              <td class="min-width fw-bold">Staffel&nbsp;{{ toRoman(index + 1) }}&nbsp;&nbsp;</td>
              <td class="text-left">
                <span style="color: red; margin-right: 5px;" v-if="staffel.meldungenCount < 4">Anzahl Läufer: {{ staffel.meldungenCount }}</span>
                <span v-if="staffel.meldungenCount == 4">Anzahl Läufer: {{ staffel.meldungenCount }}</span>
                <span
                  :class="sportler.geschlecht === 'm' ? 'staffelSportlerMaenlich' : 'staffelSportlerWeiblich'"
                  v-for="sportler of staffel.staffelSportler"
                  :key="sportler.id"
                >
                  {{ sportler.vname }} {{ sportler.name }}
                </span>
              </td>
              <td class="text-end">
                <button @click="clickDelStaffel(staffel)" type="button" class="btn btn-danger">
                  <i class="bi bi-trash"></i>
                </button>
                <button @click="clickEditStaffel(staffel, klasse)" class="btn btn-primary ms-1">
                  <i class="bi bi-pencil"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Sportler Dreikampf ohne Staffel -->
    <div v-if="sportlerDreikampfOhneStaffel.length > 0" class="mt-3">
      <h5 class="mt-3">Sportler Dreikampf ohne Staffel</h5>
      <div class="card mb-3">
        <div class="card-body">
          <table class="table table-hover table-sm">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Jahrgang (Alter)</th>
                <th scope="col">Geschlecht</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sportler in sportlerDreikampfOhneStaffel" :key="sportler.id">
                <td class="fw-bold">{{ sportler.vname }} {{ sportler.name }}</td>
                <td>{{ sportler.jahrgang }} ({{ new Date().getFullYear() - sportler.jahrgang }})</td>
                <td>{{ sportler.geschlecht }}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
import { useDataStore } from '@/stores/dataStore';

const vereineList = reactive([]);
const klassenList = reactive([]);
const sportlerDreikampfOhneStaffel = reactive([]);
const userStore = useUserStore();
const dialogStore = useDialogStore();
const dataStore = useDataStore();
const router = useRouter();
const staffelVereinsId = ref(null);

let delStaffelId;

const route = useRoute();

const isAdmin = computed(() => {
  return userStore.hasRole('admin');
});

const selectedVereinLogo = computed(() => {
  const verein = vereineList.find(verein => verein.id === staffelVereinsId.value);
  return verein ? verein.logo : '';
});

watch(staffelVereinsId, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('staffelVereinsId changed:', newVal);
    userStore.lastSelectedStaffelVereinsId = newVal;
    await getStaffelUebersichtList();
  }
});

function clickDelStaffel(staffel) {
  console.log('clickDelStaffel', staffel);
  let delStaffelDialogText = ''
  for (const sportler of staffel.staffelSportler) {
    delStaffelDialogText += `<span class="fw-bold">${sportler.name} ${sportler.vname}</span><br>`;
  }
  delStaffelId = staffel.id;
  dialogStore.setParameter(
    'Löschen',
    `Die Staffel mit folgenden Teilnehmer:<br> ${delStaffelDialogText} wirklich löschen?`,
    'Löschen',
    'btn-danger',
    'Abbrechen',
    null,
    delStaffel,
  );
}

function clickEditStaffel (staffel, klasse) {
  console.log('clickEditStaffel', staffel, klasse);
  dataStore.setEditStaffel(staffel, klasse);
  router.push({ name: 'editStaffel' });
}

async function delStaffel() {
  console.log('delStaffel delStaffelId', delStaffelId);
  try {
    const response = await fetch('/api/delStaffel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ delStaffelId }),
      credentials: 'include'  // Cookies mitsenden
    });

    if (response.ok) {
      await getStaffelUebersichtList();
    } else {
      console.log('asdf test response', response);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 152', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
    }
  } catch (error) {
    console.error('Es gab ein Problem mit Löschen des Sportlers:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 153', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

function toRoman(num) {
  const romanNumerals = [
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ];

  let result = '';
  for (const { value, numeral } of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

function checkSelectedVerein() {
  if (isAdmin.value) {
    if (userStore.lastSelectedStaffelVereinsId) {
      staffelVereinsId.value = userStore.lastSelectedStaffelVereinsId;
    }

    if (staffelVereinsId.value == null) {
      staffelVereinsId.value = selectedSportfest.value.vereineList[0].vereinId;
    } else {
      for (const verein of selectedSportfest.value.vereineList) {
        if (staffelVereinsId.value == verein.vereinId) {
          staffelVereinsId.value = verein.vereinId;

          return;
        }
      }
      staffelVereinsId.value = selectedSportfest.value.vereineList[0].vereinId;
    }
  } else {
    staffelVereinsId.value = userStore.user.verein_id;
  }
}

async function getStaffelUebersichtList() {
  try {
    let response;
    response = await fetch(`/api/getStaffelUebersicht`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sportfestId: selectedSportfest.value.id,
        vereinsId: staffelVereinsId.value
      }),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      klassenList.splice(0);

      for (const klasse of result.klassen) {
        klassenList.push(klasse);
      }

      console.log('result ', result);
      sportlerDreikampfOhneStaffel.splice(0);
      for (const sportler of result.sportlerDreikampfOhneStaffel) {
        sportlerDreikampfOhneStaffel.push(sportler);
      }

      checkSelectedVerein();
    }else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 154', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getStaffelUebersichtList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 155', `${error.message}`, 'ok', null, '', null, null);
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

    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 156', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getVereineList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 157', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

const selectedSportfest = computed(() => {
  let found = false;
  let sportfestName = '';
  let disziplinActive = {};
  let vereineList = [];

  for (const sportfest of userStore.sportfeste) {
    if (sportfest.id == route.params.sportfestId) {
      found = true;
      sportfestName = sportfest.name;
      disziplinActive = sportfest.disziplinActive;
      vereineList = sportfest.vereineList;
    }
  }

  if (!found) {
    // eslint-disable-next-line vue/no-side-effects-in-computed-properties
    router.push('/');
  }

  return {
    id: route.params.sportfestId,
    name: sportfestName,
    disziplinActive: disziplinActive,
    vereineList
  };
});

const sportfestVereineList = computed(() => {
  const list = [];

  for (const verein of vereineList) {
    for (const sportfestVerein of selectedSportfest.value.vereineList) {
      if (sportfestVerein.vereinId == verein.id) {
        list.push(verein);
      }
    }
  }

  return list;
});

const newStaffel = async (staffelObj) => {
  console.log('newStaffel');
  const response = await fetch(`/api/newStaffel`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(staffelObj),
    credentials: 'include'  // Cookies mitsenden
  });

  const result = await response.json();

  if (response.ok) {
    console.log('Staffel angelegt', result);
    return result.staffelId;
  } else {
    console.error('Fehler beim anlegen der Staffel', result);
  }
}

const clickNeueStaffel = async (klasse) => {
  console.log('clickNeueStaffel', klasse);

  const staffelId = await newStaffel({
    staffelVereinsId: staffelVereinsId.value,
    sportfestId: selectedSportfest.value.id,
    klasseId: klasse.id
  });

  dataStore.setNeueStaffel(klasse, staffelVereinsId.value, selectedSportfest.value.id, staffelId);
  router.push({ name: 'editStaffel' });
}

watch (selectedSportfest, (newVal, oldVal) => {
  if (newVal.id !== oldVal.id) {
    getStaffelUebersichtList();
  }
});

onMounted(() => {
  console.log('onMounted');
  getVereineList();
  getStaffelUebersichtList();
});
</script>

<style scoped>

.staffelSportlerMaenlich {
  display: inline-block;
  margin-left: 5px;
  margin-right: 5px;
  padding-left: 7px;
  padding-right: 7px;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.staffelSportlerWeiblich {
  display: inline-block;
  margin-left: 5px;
  margin-right: 5px;
  padding-left: 7px;
  padding-right: 7px;
  background-color: #e2dff0;
  border-radius: 8px;
}
.min-width {
  white-space: nowrap;
  width: 1%;
}
</style>