<template>
  <header class="app-header">
    <!-- Header Adminbereich angemeldet -->
    <div v-if="isLoggedIn">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">{{ userStore.user.username }}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <RouterLink class="nav-link" to="/">Home</RouterLink>
              </li>
              <li v-if="showUserLink" class="nav-item">
                <RouterLink class="nav-link" to="/users">Benutzer</RouterLink>
              </li>
              <li v-if="showSportlerLink" class="nav-item">
                <RouterLink class="nav-link" to="/sportler">Sportler</RouterLink>
              </li>
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Anmeldung 3/4 Kampf
                </a>
                <ul class="dropdown-menu">
                  <li v-for="sportfest of userStore.sportfeste" :key="sportfest.id">
                    <RouterLink class="dropdown-item" :to="`/sportlerAnmeldung/${sportfest.id}`">{{sportfest.name}}</RouterLink>
                  </li>
                </ul>
              </li>
            </ul>
            <div class="d-flex">
              <button @click="doLogout" class="btn btn-outline-success" type="button">Logout</button>
            </div>
          </div>
        </div>
      </nav>
    </div>
    <!-- Normaler Haeder -->
    <div v-if="!isLoggedIn">
      <RouterLink to="/login">Login</RouterLink>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import { watch } from 'vue';

const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);
const router = useRouter();

watch(() => userStore.isLoggedIn, (newValue) => {
  if (newValue) {
    getAktiveSportfeste();
  }
});

// Ermitteln ob der Benutzer die Berechtigung für den Link Benutzer hat
const userRoute = router.getRoutes().find(route => route.name === 'users');
const userRouteRole = userRoute.meta.requiresRole;
const showUserLink = computed(() => {
  return userStore.hasRole(userRouteRole);
});

// Ermitteln ob der Benutzer die Berechtigung für den Link Sportler hat
const sportlerRoute = router.getRoutes().find(route => route.name === 'sportler');
const sportlerRouteRole = sportlerRoute.meta.requiresRole;
const showSportlerLink = computed(() => {
  return userStore.hasRole(sportlerRouteRole);
});

// Ermitteln ob der Benutzer die Berechtigung für den Link Sportler hat
const sportlerAnmeldungRoute = router.getRoutes().find(route => route.name === 'sportlerAnmeldung');
const sportlerAnmeldungRouteRole = sportlerAnmeldungRoute.meta.requiresRole;
const showSportlerAnmeldungLink = computed(() => {
  return userStore.hasRole(sportlerAnmeldungRouteRole);
});

// Benutzer abmelden
const doLogout = async () => {
  console.log('doLogout');

  // Benutzer aus dem Store entfernen
  await userStore.logout()

  // Weiterleitung nach erfolgreichem Logout
  router.push('/');
}

const getAktiveSportfeste = async () => {
  console.log('getAktiveSportfeste');
  const response = await fetch(`/api/getAktiveSportfeste`, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user: userStore.user }),
    credentials: 'include'  // Cookies mitsenden
  });

  const result = await response.json();

  if (response.ok) {
    console.log('Sportfeste', result);
    userStore.sportfeste = result.sportfestList;
  } else {
    console.error('Fehler beim Laden der Sportfeste', result);
  }
}

onMounted(async () => {
});


</script>

<style scoped>
.app-header {
  position: fixed;
  /* Macht den Header fixiert */
  top: 0;
  /* Setzt ihn an den oberen Rand */
  left: 0;
  /* Setzt ihn an den linken Rand */
  width: 100%;
  /* Header soll die gesamte Breite einnehmen */
  /* background-color: #fff; Hintergrundfarbe (anpassen nach Bedarf) */
  z-index: 1000;
  /* Stellt sicher, dass der Header über anderen Inhalten liegt */
}
</style>
