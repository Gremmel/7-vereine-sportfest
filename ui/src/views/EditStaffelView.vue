<template>
  <div class="container">
    <h2 class="mb-4">Staffel {{ dataStore.klasseStaffel.name }}</h2>
    <button class="btn btn-success mb-3" @click="clickWeitereStaffel()">Weitere Staffel hinzufügen</button>
    <div>
      <div v-if="dataStore.klasseStaffel.gemixt == 1" class="form-check form-switch mb-2 custom-switch">
        <input v-model="mixedStaffel" :disabled="countWeiblich > 0" class="form-check-input me-2" type="checkbox" role="switch" id="flexSwitchCheckMixed">
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
                  (!staffelVoll && sportler.geschlecht === 'w' && countWeiblich < 3)"
                >
                <i
                  v-if="!sportler.laeuferNr"
                  @click="clickNewStaffelLaeufer(sportler)"
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
import { onMounted, onBeforeMount, reactive, ref, computed, watch } from 'vue';
import { nextTick } from 'vue';
import { useDialogStore } from '@/stores/dialogStore';
import { useDataStore } from '@/stores/dataStore';

const dialogStore = useDialogStore();
const dataStore = useDataStore();
const klasseSportlerList = reactive([]);
const mixedStaffel = ref(false);
let merkerWeitereStaffel = false
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
    if (!merkerWeitereStaffel) {
      console.log('saveStaffelMeldungen');
      saveStaffelMeldungen();
    }
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
        dialogStore.setParameter('Fehlercode 110', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'Fehler bei saveStaffelMeldungen');
    }
  } catch (error) {
    console.error('Fehler bei saveStaffelMeldungen:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 111', `${error.message}`, 'ok', null, '', null, null);
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

const clickWeitereStaffel = async () => {
  merkerWeitereStaffel = true;
  staffel.meldungen.lNr1 = null;
  staffel.meldungen.lNr2 = null;
  staffel.meldungen.lNr3 = null;
  staffel.meldungen.lNr4 = null;
  const staffelId = await newStaffel({
    staffelVereinsId: staffel.vereinsId,
    sportfestId: staffel.sportfestId,
    klasseId: staffel.klassenId
  });

  staffel.id = staffelId;
  dataStore.setWeitereStaffel(staffelId);
  getKlasseSportler();
  merkerWeitereStaffel = false;
}

const setSportlerMeldungenToStore = () => {
  dataStore.editStaffel.staffelSportler = [];

  for (const sportler of klasseSportlerList) {
    if (sportler.laeuferNr) {
      dataStore.editStaffel.staffelSportler.push(sportler);
    }
  }
};

const clickNewStaffelLaeufer = function (sportler) {
  if (!staffel.meldungen.lNr1) {
    staffel.meldungen.lNr1 = sportler.id;
  } else if (!staffel.meldungen.lNr2) {
    staffel.meldungen.lNr2 = sportler.id;
  } else if (!staffel.meldungen.lNr3) {
    staffel.meldungen.lNr3 = sportler.id;
  } else if (!staffel.meldungen.lNr4) {
    staffel.meldungen.lNr4 = sportler.id;
  }

  dataStore.neueStaffel = false;
  dataStore.editStaffel.id = staffel.id;

  nextTick(() => {
    setSportlerMeldungenToStore();
  });
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
  dataStore.neueStaffel = false;
  dataStore.editStaffel.id = staffel.id;

  nextTick(() => {
    setSportlerMeldungenToStore();
  });
};

const countWeiblich = computed(() => {
  if (klasseSportlerListShow.value.length > 0 && dataStore.klasseStaffel.gemixt === '1' && mixedStaffel.value) {
    let cWeiblich = 0;

    for (const sportler of klasseSportlerListShow.value) {
      if (sportler.geschlecht === 'w' && sportler.laeuferNr) {
        cWeiblich += 1;
      }
    }

    return cWeiblich;
  } else {
    return 0;
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
      || dataStore.klasseStaffel.gemixt === '0') {
      list.push(sportler);
    }
  }

  list.sort((a, b) => {
    if (a.jahrgang === b.jahrgang) {
      return a.name.localeCompare(b.name);
    }
    return a.jahrgang - b.jahrgang;
  });

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

      // wenn edit Staffel die bereits gewählten Sportler in die Liste übernehmen
      if (!dataStore.neueStaffel && dataStore?.editStaffel?.staffelSportler) {
        let isMixed = false;

        for (const sportler of dataStore.editStaffel.staffelSportler) {
          if (sportler.geschlecht === 'w' && sportler.laeuferNr) {
            isMixed = true;
          }
          if (sportler.laeuferNr === 1) {
            staffel.meldungen.lNr1 = sportler.id;
          } else if (sportler.laeuferNr === 2) {
            staffel.meldungen.lNr2 = sportler.id;
          } else if (sportler.laeuferNr === 3) {
            staffel.meldungen.lNr3 = sportler.id;
          } else if (sportler.laeuferNr === 4) {
            staffel.meldungen.lNr4 = sportler.id;
          }

          klasseSportlerList.push(sportler)
        }

        if (isMixed) {
          mixedStaffel.value = true;
        }
      }

    } else {
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 112', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      }, 1000);
      console.log(result.message || 'keine Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der getKLasseSportler:', error);
    setTimeout(() => {
      dialogStore.setParameter('Fehlercode 113', `${error.message}`, 'ok', null, '', null, null);
    }, 1000);
  }
}

onBeforeMount(() => {
  console.log('onCreated EditStaffelView');
});

onMounted(() => {
  console.log('onMounted EditStaffelView');
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
