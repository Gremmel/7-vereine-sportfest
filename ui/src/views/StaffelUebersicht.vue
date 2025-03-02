<template>
  <div class="container">
    <h2>Staffel {{ selectedSportfest.name }}</h2>
    <div v-for="klasse of klassenList" :key="klasse.id" class="card mb-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="card-title">{{ klasse.name }}</h5>
        <button class="btn btn-primary" @click="clickNeueStaffel(klasse)">Neue Staffel hinzufügen</button>
      </div>
      <div class="card-body">
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

if (isAdmin.value) {
  // todo  mit select value ersetzten
  staffelVereinsId.value = 7;
} else {
  staffelVereinsId.value = userStore.user.vereinId;
}

async function getStaffelUebersichtList() {
  try {
    let response;
    response = await fetch(`/api/getStaffelUebersicht`, {
      method: 'GET',
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
        dialogStore.setParameter('Fehlercode 103', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getStaffelUebersichtList:', error);
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

    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 103', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getVereineList:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 107', `${error.message}`, 'ok', null, '', null, null);
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

function clickNeueStaffel(klasse) {
  console.log('clickNeueStaffel', klasse);
  dataStore.setNeueStaffel(klasse, staffelVereinsId.value, selectedSportfest.value.id);
  router.push({ name: 'editStaffel' });
}

watch (selectedSportfest, (newVal, oldVal) => {
  if (newVal.id !== oldVal.id) {
    //todo
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