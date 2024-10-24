<template>
  <header class="app-header">
    <!-- Header Adminbereich angemeldet -->
    <div v-if="isLoggedIn">
      <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
        <div class="container-fluid">
          <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto">
              <li class="nav-item">
                <RouterLink class="nav-link" to="/">Home</RouterLink>
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link" to="/about">About</RouterLink>
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

  // Benutzer abmelden
  const doLogout = async () => {
    console.log('doLogout');

    // Benutzer aus dem Store entfernen
    userStore.clearUser();

    // Beim Server abmelden
    try {
      const response = await fetch('/api/logout', {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();
      console.log('doLogout response', response);

      if (response.ok) {
        console.log('logout IO');
      } else {
        console.error(result.message || 'Login fehlgeschlagen');
      }
    } catch (error) {
      console.error('Es gab ein Problem mit dem Abmelden beim Server:', error);
    }

    // Weiterleitung nach erfolgreichem Logout
    router.push('/');
  }

</script>

<style scoped>
</style>
