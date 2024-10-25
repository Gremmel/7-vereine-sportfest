<template>
  <div class="container mt-5">
    <h2>Neuen Benutzer anlegen</h2>
    <form @submit.prevent="submitForm">
      <div class="mb-3">
        <label for="username" class="form-label">Benutzername</label>
        <input
          type="text"
          id="username"
          v-model="form.username"
          class="form-control"
          required
        />
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">E-Mail</label>
        <input
          type="email"
          id="email"
          v-model="form.email"
          class="form-control"
          required
        />
      </div>

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

      <div class="mb-3">
        <label for="roles" class="form-label">Rollen</label>
        <select
          id="roles"
          v-model="selectedRoles"
          class="form-select"
          multiple
        >
          <option value="admin">Admin</option>
          <option value="benutzer" selected>Benutzer</option>
        </select>
      </div>

      <div v-if="!passwordCheck" class="text-warning m-2">Passwort wiederholung ist nicht korrekt</div>

      <button type="submit" :disabled="disabledSubmit" class="btn btn-primary">Benutzer anlegen</button>

      <div class="m-2 text-danger" v-if="errorMessage">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script setup>
  import { ref, computed } from 'vue';
  import { useRouter } from 'vue-router';

  const form = ref({
    username: '',
    email: '',
    password: '',
    password2: '',
  });

  const router = useRouter();
  const selectedRoles = ref(['benutzer']);
  const errorMessage = ref('');
  const submitted = ref(false);
  const passwordCheck = computed(() => form.value.password === form.value.password2);
  const disabledSubmit = computed(() => {
    if (form.value.username === '' || form.value.email === '' || form.value.password === '' || !passwordCheck.value) {
      return true;
    } else {
      return false;
    }
  });

  const submitForm = async () => {
    submitted.value = true;

    try {
      const response = await fetch('/api/adduser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: form.value.username,
          email: form.value.email,
          password: form.value.password,
          roles: JSON.stringify(selectedRoles.value),
          enabled: '1'
        }),
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();
      console.log('handleLogin response', response);

      if (response.ok) {
        errorMessage.value = '';

        // Weiterleitung nach erfolgreichem Login
        router.push('/users');
      } else {
        errorMessage.value = result.message || 'anlegen des Benutzers fehlgeschlagen';
      }
    } catch (error) {
      console.error('Es gab ein Problem mit der anlegen des Benutzers:', error);
      errorMessage.value = 'Es gab ein Problem mit der anlegen des Benutzers. Bitte versuche es erneut.';
    }
  };
</script>

<style>
</style>
