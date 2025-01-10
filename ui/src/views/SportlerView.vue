<template>
  <div class="container">
    <div class="card">
      <div class="card-body">
        <h2 class="card-title">Teilnehmer</h2>
        <div class="input-group mb-3">
          <input v-model="searchText" type="text" class="form-control" placeholder="finde...">
          <button @click="clickClearTextSearch()" class="btn btn-outline-secondary" type="button" id="button-addon2">X</button>
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
                <span class="sortCollums" @click="clickSortVorname()">Vorname</span>
                <i v-if="searchText === '' && sortOrder === 'Vorname_ASC'" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Vorname_DSC'" class="bi bi-arrow-up"></i>
              </th>
              <th scope="col">
                <span class="sortCollums" @click="clickSortJahrgang()">Jahrgang</span>
                <i v-if="searchText === '' && sortOrder === 'Jahrgang_ASC'" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Jahrgang_DSC'" class="bi bi-arrow-up"></i>
              </th>
              <th scope="col">
                <span class="sortCollums" @click="clickSortGeschlecht()">Geschlecht</span>
                <i v-if="searchText === '' && sortOrder === 'Geschlecht_ASC'" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Geschlecht_DSC'" class="bi bi-arrow-up"></i>
              </th>
              <th v-if="isAdmin" scope="col">
                <span class="sortCollums" @click="clickSortVerein()">Verein</span>
                <i v-if="searchText === '' && sortOrder === 'Vereinsname_ASC'" class="bi bi-arrow-down"></i>
                <i v-if="searchText === '' && sortOrder === 'Vereinsname_DSC'" class="bi bi-arrow-up"></i>
              </th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input v-model="newSportler.name" type="text" class="form-control" ></td>
              <td><input v-model="newSportler.vname" type="text" class="form-control" ></td>
              <td><input v-model="newSportler.jahrgang" type="text" class="form-control" ></td>
              <td><select v-model="newSportler.geschlecht" class="form-select">
                <option value="m">männlich</option>
                <option value="w">weiblich</option>
              </select></td>
              <td v-if="isAdmin"></td>
            </tr>
            <tr v-for="sportler in sportlerListShow" :key="sportler.id">
              <td>{{sportler.name}}</td>
              <td>{{sportler.vname}}</td>
              <td>{{sportler.jahrgang}}</td>
              <td>{{sportler.geschlecht}}</td>
              <td v-if="isAdmin">{{sportler.vereinsname}}</td>
            </tr>
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
  import Fuse from 'fuse.js';

  const sportlerList = reactive([]);
  const userStore = useUserStore();
  const router = useRouter();
  let sortOrder = ref('Name_DSC');
  let fuseSearch;
  let searchText = ref('');
  const newSportler = ref({
    name: '',
    vname: '',
    jahrgang: '',
    geschlecht: '',
    vereinsname: ''
  });

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

  function clickClearTextSearch () {
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
        console.log(result.message || 'keine Daten vorhanden');
      }
    } catch (error) {
      console.error('Es gab ein Problem mit dem Abrufen der getUserList:', error);
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

  const sportlerListShow = computed(() => {
    if (!sportlerList) {
      return [];
    }

    let sortedList = [];

    if (searchText.value !== '') {
      const searchResult = fuseSearch.search(searchText.value);

      for (const obj of searchResult) {
        sortedList.push(obj.item);
      }
    } else {
      sortedList = [...sportlerList]; // Erstelle eine Kopie des Arrays

      if (sortOrder.value === 'Name_ASC') {
        sortedList.sort((a, b) => a.name.localeCompare(b.name, "de", { sensitivity: 'base' }));
      } else if (sortOrder.value === 'Name_DSC') {
        sortedList.sort((a, b) => b.name.localeCompare(a.name, "de", { sensitivity: "base" }));
      } else if (sortOrder.value === 'Vorname_ASC') {
        sortedList.sort((a, b) => a.vname.localeCompare(b.vname, "de", { sensitivity: 'base' }));
      } else if (sortOrder.value === 'Vorname_DSC') {
        sortedList.sort((a, b) => b.vname.localeCompare(a.vname, "de", { sensitivity: "base" }));
      } else if (sortOrder.value === 'Jahrgang_ASC') {
        sortedList.sort((a, b) => a.jahrgang.localeCompare(b.jahrgang, "de", { sensitivity: 'base' }));
      } else if (sortOrder.value === 'Jahrgang_DSC') {
        sortedList.sort((a, b) => b.jahrgang.localeCompare(a.jahrgang, "de", { sensitivity: "base" }));
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

  const isAdmin = computed(() => {
    return userStore.hasRole('admin');
  });

  onMounted(() => {
    console.log('onMounted');
    getSportlerList(isAdmin.value);
  });
</script>

<style scoped>
  .sortCollums {
    cursor: pointer;
  }
</style>