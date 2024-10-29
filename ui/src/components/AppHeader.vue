<template>
  <header class="app-header">
    <!-- Header Adminbereich angemeldet -->
    <div v-if="isLoggedIn">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <a class="navbar-brand" href="#">{{userStore.user.username}}</a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
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

  const userStore = useUserStore();
  const isLoggedIn = computed(() => userStore.isLoggedIn);
  const router = useRouter();

  // Ermitteln ob der Benutzer die Berechtigung für den Link Benutzer hat
  const userRoute = router.getRoutes().find(route => route.name === 'users');
  const userRouteRole = userRoute.meta.requiresRole;
  const showUserLink = computed(() => {
    return userStore.hasRole(userRouteRole);
  });

  // Benutzer abmelden
  const doLogout = async () => {
    console.log('doLogout');

    // Benutzer aus dem Store entfernen
    await userStore.logout()

    // Weiterleitung nach erfolgreichem Logout
    router.push('/');
  }

</script>

<style scoped>
.app-header {
  position: fixed; /* Macht den Header fixiert */
  top: 0; /* Setzt ihn an den oberen Rand */
  left: 0; /* Setzt ihn an den linken Rand */
  width: 100%; /* Header soll die gesamte Breite einnehmen */
  /* background-color: #fff; Hintergrundfarbe (anpassen nach Bedarf) */
  z-index: 1000; /* Stellt sicher, dass der Header über anderen Inhalten liegt */
}
</style>
