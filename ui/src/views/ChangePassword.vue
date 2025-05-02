<template>
  <div class="container mt-5">
    <h2>Passwort ändern</h2>
    <div>
      <div class="mb-3">
        <label for="password" class="form-label">Passwort</label>
        <input
          type="password"
          id="password"
          v-model="form.password"
          class="form-control"
          required
        />
      </div>

      <div class="mb-3">
        <label for="password2" class="form-label">Passwort wiederholung</label>
        <input
          type="password"
          id="password2"
          v-model="form.password2"
          class="form-control"
          required
        />
      </div>

      <div v-if="!passwordCheck" class="text-danger m-2">Passwort wiederholung ist nicht korrekt</div>

      <button @click="clickUserEdit" type="button" :disabled="disabledSubmit" class="btn btn-primary">Passwort ändern</button>

      <div class="m-2 text-danger" v-if="errorMessage">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';

  const userStore = useUserStore();
  const form = ref({
    id: userStore.user.id,
    password: '',
    password2: '',
  });

  const router = useRouter();
  const errorMessage = ref('');
  const submitted = ref(false);
  const passwordCheck = computed(() => form.value.password === form.value.password2);
  const disabledSubmit = computed(() => {
    if (form.value.password === '' || !passwordCheck.value) {
      return true;
    } else {
      return false;
    }
  });

  async function clickUserEdit () {
    submitted.value = true;

    try {
      const response = await fetch('/api/changePassword', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: form.value.id,
          password: form.value.password
        }),
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();
      console.log('response', response);

      if (response.ok) {
        errorMessage.value = '';

        // Weiterleitung nach erfolgreichem ändern
        router.push('/');
      } else if (response.status === 401) {
        // Benutzer aus dem Store entfernen
        userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

        await userStore.logout()

        router.push('/login');
      } else {
        errorMessage.value = result.message || 'Andern des Passwortes ist fehlgeschlagen';
      }
    } catch (error) {
      console.error('Andern des Passwortes ist fehlgeschlagen:', error);
      errorMessage.value = 'Andern des Passwortes ist fehlgeschlagen. Bitte versuche es erneut: ' + error;
    }
  };
</script>

<style>
</style>
