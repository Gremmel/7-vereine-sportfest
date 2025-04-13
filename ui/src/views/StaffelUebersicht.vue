<template>
  <div class="container">
    <h2>Staffel {{ selectedSportfest.name }}</h2>
    <div v-if="isAdmin" class="d-flex align-items-center mb-3">
      <label for="vereineSelect" class="form-label me-2">Verein: </label>
      <select v-model="staffelVereinsId" class="form-select" aria-label="Default select example">
        <option v-for="verein of vereineList" :key="verein.id" :value="verein.id">{{ verein.name }}</option>
      </select>
    </div>
    <div v-for="klasse of klassenList" :key="klasse.id" class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center" style="background-color: #e3e3e3;">
        <h5 class="card-title">{{ klasse.name }}</h5>
        <button class="btn btn-success" @click="clickNeueStaffel(klasse)">Neue Staffel hinzufügen</button>
      </div>
      <div class="card-body">
        <table class="table table-hover table-sm">
          <tbody>
            <tr v-for="(staffel, index) of klasse.staffeln" :key="staffel.id">
              <td>Staffel {{ index + 1 }}</td>
              <td class="text-center">
                <span style="color: red;" v-if="staffel.meldungenCount < 4">anzahl Läufer: {{ staffel.meldungenCount }}</span>
                <span v-if="staffel.meldungenCount == 4">anzahl Läufer: {{ staffel.meldungenCount }}</span>
              </td>
              <td class="text-end">
                <button v-if="!editMode" @click="clickDelStaffel(staffel)" type="button" class="btn btn-danger">
                  <i class="bi bi-trash"></i>
                </button>
                <button v-if="!editMode" @click="clickEditStaffel(staffel)" class="btn btn-primary ms-1">
                  <i class="bi bi-pencil"></i>
                </button>
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
import { useDataStore } from '@/stores/dataStore';

const vereineList = reactive([]);
const klassenList = reactive([]);
const userStore = useUserStore();
const dialogStore = useDialogStore();
const dataStore = useDataStore();
const router = useRouter();
const staffelVereinsId = ref(null);

const route = useRoute();

const isAdmin = computed(() => {
  return userStore.hasRole('admin');
});

staffelVereinsId.value = userStore.user.verein_id;

watch(staffelVereinsId, async (newVal, oldVal) => {
  if (newVal !== oldVal) {
    console.log('staffelVereinsId changed:', newVal);
    await getStaffelUebersichtList();
  }
});

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

    }else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getStaffelUebersichtList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
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
</style>