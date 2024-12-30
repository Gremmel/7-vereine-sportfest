<template>
  hallo
</template>

<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';

  const sportlerList = reactive([]);
  const userStore = useUserStore();
  const router = useRouter();

  async function getSportlerList() {
    try {
      const vereinsID = userStore.user.verein_id;
      const response = await fetch(`/api/getSportlerList/${vereinsID}`, {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();

      if (response.ok) {
        sportlerList.splice(0);

        for (const sportler of result.sportlerList) {
          sportlerList.push(sportler);
        }

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

  onMounted(() => {
    console.log('onMounted');
    getSportlerList();
  });
</script>