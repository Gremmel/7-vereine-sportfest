<script setup>
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import { useUserStore } from '@/stores/userStore';
import { onMounted } from 'vue';
import DialogModal from './components/DialogModal.vue';

const userStore = useUserStore();

async function getSessionData() {
  try {
    const response = await fetch('/api/getSession', {
      method: 'GET',
      credentials: 'include'  // Cookies mitsenden
    });

    const result = await response.json();
    console.log('getSession result', result);

    if (response.ok) {
      userStore.setUser(result.user);
    } else {
      console.log(result.message || 'keine Session Daten vorhanden');
    }
  } catch (error) {
    console.error('Es gab ein Problem mit dem Abrufen der Sessiondaten:', error);
  }
  userStore.getSessionDataFinished = true;
}

onMounted(() => {
  getSessionData();
});

</script>

<template>
  <AppHeader />
  <RouterView />
  <DialogModal />
</template>

<style>
body {
  margin: 0; /* Entfernt den Standard-Margin */
  padding-top: 4rem; /* Optional: Platz schaffen, damit der Inhalt nicht unter dem Header verborgen ist */
}
</style>
