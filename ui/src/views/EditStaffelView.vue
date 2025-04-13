<template>
  <div class="container">
    <h2 class="mb-4">Staffel {{ dataStore.klasseStaffel.name }}</h2>
    <div>
      <div v-if="dataStore.klasseStaffel.gemixt == 1" class="form-check form-switch mb-2 custom-switch">
        <input v-model="mixedStaffel" class="form-check-input me-2" type="checkbox" role="switch" id="flexSwitchCheckMixed">
        <label class="form-check-label" for="flexSwitchCheckMixed">gemixte Staffel</label>
      </div>
    </div>
    <div class="card mb-3">
      <table class="table table-striped table-hover">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Jahrgang</th>
            <th scope="col">Geschlecht</th>
            <th class="text-center" scope="col">Aktionen</th>
            <th scope="col">Läufernummer</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="sportler of klasseSportlerListShow" :key="sportler.id">
            <td>{{ sportler.name }} {{ sportler.vname }} </td>
            <td>{{ sportler.jahrgang }} ({{ sportler.sportleralter }})</td>
            <td>{{ sportler.geschlecht === 'm' ? 'männlich' : 'weiblich' }}</td>
            <td class="text-center" style="width: 10px;">
              <template v-if="sportler.laeuferNr ||
                  (!staffelVoll && sportler.geschlecht === 'm') ||
                  (!staffelVoll && sportler.geschlecht === 'w' && !maxWeiblich)"
                >
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
            <td style="width: 10px;">
              <template v-if="sportler.laeuferNr">
                <div class="btn-group" role="group" aria-label="Läufernummer">
                  <button
                    v-for="num in [1, 2, 3, 4]"
                    :key="num"
                    type="button"
                    class="btn btn-sm"
                    :class="{ 'btn-outline-dark': sportler.laeuferNr !== num, active: sportler.laeuferNr === num, 'btn-outline-success': sportler.laeuferNr === num }"
                    @click="clickSportlerNr(sportler.id, num)"
                  >
                    {{ num }}
                  </button>
                </div>
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
const mixedStaffel = ref(false);
const staffel = reactive({
  id: dataStore.staffelId,
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

watch(() => staffel.meldungen, (newVal) => {
    console.log('Staffel meldungen changed:', newVal);
    // todo hier müssen wier die änderungen an den server schicken
    saveStaffelMeldungen();
  }, { deep: true }
);

async function saveStaffelMeldungen () {
  try {
    let response;
    response = await fetch(`/api/saveStaffelMeldungen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(staffel),
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();

    if (!response.ok) {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'Fehler bei saveStaffelMeldungen');
    }
  } catch (error) {
    console.error('Fehler bei saveStaffelMeldungen:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

const clickSportlerNr = (sportlerId, laeuferNr) => {
  let lastNr = null;

  if (staffel.meldungen.lNr1 === sportlerId) {
    staffel.meldungen.lNr1 = null;
    lastNr = 1;
  } else if (staffel.meldungen.lNr2 === sportlerId) {
    staffel.meldungen.lNr2 = null;
    lastNr = 2;
  } else if (staffel.meldungen.lNr3 === sportlerId) {
    staffel.meldungen.lNr3 = null;
    lastNr = 3;
  } else if (staffel.meldungen.lNr4 === sportlerId) {
    staffel.meldungen.lNr4 = null;
    lastNr = 4;
  }

  if (staffel.meldungen[`lNr${laeuferNr}`] !== null) {
    staffel.meldungen[`lNr${lastNr}`] = staffel.meldungen[`lNr${laeuferNr}`];
  }

  staffel.meldungen[`lNr${laeuferNr}`] = sportlerId;
};

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

const maxWeiblich = computed(() => {
  if (klasseSportlerListShow.value.length > 0 && dataStore.klasseStaffel.gemixt === '1' && mixedStaffel.value) {
    let countWeiblich = 0;

    for (const sportler of klasseSportlerListShow.value) {
      if (sportler.geschlecht === 'w' && sportler.laeuferNr) {
        countWeiblich += 1;
      }
    }

    if (countWeiblich > 2) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
});

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

    if (dataStore.klasseStaffel.gemixt ==='1' && !mixedStaffel.value && sportler.geschlecht === 'm'
      || mixedStaffel.value
      || dataStore.klasseStaffel.gemixt === '0' && sportler.geschlecht === 'w') {
      list.push(sportler);
    }
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
      dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
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

  .custom-switch .form-check-input {
    width: 2.2rem;
    height: 1.2rem;
  }
</style>
