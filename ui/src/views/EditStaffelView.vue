<template>
  <div class="container">
    <h2 class="mb-4">Staffel {{ dataStore.klasseStaffel.name }}</h2>
    <div class="card mb-3">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Jahrgang</th>
            <th scope="col">Geschlecht</th>
            <th scope="col">Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sportler of klasseSportlerListShow" :key="sportler.id">
            <td>{{ sportler.name }} {{ sportler.vname }} </td>
            <td>{{ sportler.jahrgang }} ({{ sportler.sportleralter }})</td>
            <td>{{ sportler.geschlecht === 'm' ? 'männlich' : 'weiblich' }}</td>
            <td>
              <template v-if="!staffelVoll || sportler.laeuferNr">
                <i
                  v-if="!sportler.laeuferNr"
                  @click="clickNewStaffelLaeufer(sportler.id)"
                  class="bi bi-check-circle"
                  style="cursor: pointer; font-size: 1.5rem;">
                </i>
                <i
                  v-if="sportler.laeuferNr"
                  @click="clickDelStaffelLaeufer(sportler.id)"
                  class="bi bi-x-circle text-danger"
                  style="cursor: pointer; font-size: 1.5rem;">
                </i>
              </template>
              <template v-else>
                <i
                  class="bi bi-check-circle"
                  style="cursor: pointer; font-size: 1.5rem; color:lightgrey;">
                </i>
              </template>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useDialogStore } from '@/stores/dialogStore';
import { useDataStore } from '@/stores/dataStore';

const userStore = useUserStore();
const dialogStore = useDialogStore();
const dataStore = useDataStore();
const router = useRouter();
const klasseSportlerList = reactive([]);
const staffel = reactive({
  id: null,
  vereinsId: dataStore.staffelVereinsId,
  klassenId: dataStore.klasseStaffel.id,
  sportfestId: dataStore.staffelSportfestId,
  meldungen: {
    lNr1: null,
    lNr2: null,
    lNr3: null,
    lNr4: null
  }
});

const staffelVoll = computed(() => {
  if (staffel.meldungen.lNr1 && staffel.meldungen.lNr2 && staffel.meldungen.lNr3 && staffel.meldungen.lNr4) {
    return true;
  } else {
    return false;
  }
});

const  clickNewStaffelLaeufer = function (sportlerId) {
  if (!staffel.meldungen.lNr1) {
    staffel.meldungen.lNr1 = sportlerId;
  } else if (!staffel.meldungen.lNr2) {
    staffel.meldungen.lNr2 = sportlerId;
  } else if (!staffel.meldungen.lNr3) {
    staffel.meldungen.lNr3 = sportlerId;
  } else if (!staffel.meldungen.lNr4) {
    staffel.meldungen.lNr4 = sportlerId;
  }
};

const clickDelStaffelLaeufer = function (sportlerId) {
  if (staffel.meldungen.lNr1 === sportlerId) {
    staffel.meldungen.lNr1 = null;
  } else if (staffel.meldungen.lNr2 === sportlerId) {
    staffel.meldungen.lNr2 = null;
  } else if (staffel.meldungen.lNr3 === sportlerId) {
    staffel.meldungen.lNr3 = null;
  } else if (staffel.meldungen.lNr4 === sportlerId) {
    staffel.meldungen.lNr4 = null;
  }
};

const klasseSportlerListShow = computed(() => {
  const list = [];

  for (const sportler of klasseSportlerList) {
    if (staffel.meldungen.lNr1 === sportler.id) {
      sportler.laeuferNr = 1;
    } else if (staffel.meldungen.lNr2 === sportler.id) {
      sportler.laeuferNr = 2;
    } else if (staffel.meldungen.lNr3 === sportler.id) {
      sportler.laeuferNr = 3;
    } else if (staffel.meldungen.lNr4 === sportler.id) {
      sportler.laeuferNr = 4;
    } else {
      sportler.laeuferNr = null;
    }

    list.push(sportler);
  }

  return list;
});

async function getKlasseSportler() {
  try {
    let response;
    response = await fetch(`/api/getKlasseSportler`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        staffelVereinsId: dataStore.staffelVereinsId,
        maxalter: dataStore.klasseStaffel.maxalter,
        minalter: dataStore.klasseStaffel.minalter,
        geschlecht: dataStore.klasseStaffel.geschlecht,
        sportfestId: dataStore.staffelSportfestId,
        gemixt: dataStore.klasseStaffel.gemixt
      }),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (response.ok) {
      klasseSportlerList.splice(0);

      for (const staffelSportler of result.klasseSportlerList) {
        klasseSportlerList.push(staffelSportler);
      }

    }else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getKLasseSportler:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 107', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

onMounted(() => {
  console.log('onMounted');
  getKlasseSportler();
});
</script>

<style scoped>
  tr {
    line-height: 1.6rem;
  }
</style>