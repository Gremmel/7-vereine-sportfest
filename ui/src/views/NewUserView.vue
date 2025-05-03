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
        <label for="telefon" class="form-label">Telefonnr.</label>
        <input
          type="text"
          id="telefon"
          v-model="form.telefon"
          class="form-control"
        />
      </div>

      <div class="mb-3">
        <label for="roles" class="form-label">Verein</label>
        <select
          id="roles"
          v-model="form.vereinsId"
          class="form-select"
          required
          size="7"
        >
          <option v-for="verein of vereineList" :key="verein.id" :value="verein.id">{{ verein.name }}</option>
        </select>
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

      <div v-if="!passwordCheck" class="text-danger m-2">Passwort wiederholung ist nicht korrekt</div>

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

      <button type="submit" :disabled="disabledSubmit" class="btn btn-primary">Benutzer anlegen</button>

      <div class="m-2 text-danger" v-if="errorMessage">{{ errorMessage }}</div>
    </form>
  </div>
</template>

<script setup>
  import { onMounted, ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';
  import { useDialogStore } from '@/stores/dialogStore';

  const form = ref({
    username: '',
    email: '',
    telefon: '',
    password: '',
    password2: '',
    vereinsId: ''
  });

  const router = useRouter();
  const selectedRoles = ref(['benutzer']);
  const errorMessage = ref('');
  const submitted = ref(false);
  const dialogStore = useDialogStore();
  const passwordCheck = computed(() => form.value.password === form.value.password2);
  const disabledSubmit = computed(() => {
    if (!form.value.vereinsId || form.value.username === '' || form.value.email === '' || form.value.password === '' || !passwordCheck.value) {
      return true;
    } else {
      return false;
    }
  });

  const vereineList = reactive([]);

  async function getVereineList() {
    try {
      let response;
      response = await fetch(`/api/getVereineList`, {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();

      if (response.ok) {
        vereineList.splice(0);

        for (const vereine of result.vereineList) {
          vereineList.push(vereine);
        }

        vereineList.sort((a, b) => a.name.localeCompare(b.name));

      } else if (response.status === 401) {
        // weiterleiten zum login
        dialogStore.setParameter('Fehlercode 127', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      } else {
        setTimeout(() => {
          dialogStore.setParameter('Fehlercode 128', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
        }, 1000);
        console.log(result.message || 'keine Daten vorhanden');
      }
    } catch (error) {
      console.error('Es gab ein Problem mit dem Abrufen der getVereineList:', error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 129', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  }

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
          telefon: form.value.telefon,
          password: form.value.password,
          roles: JSON.stringify(selectedRoles.value),
          vereinsId: form.value.vereinsId,
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
      } else if (response.status === 401) {
        // Benutzer aus dem Store entfernen
        const userStore = useUserStore();

        userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

        await userStore.logout()

        // Weiterleitung nach erfolgreichem Logout
        router.push('/login');
      } else {
        errorMessage.value = result.message || 'anlegen des Benutzers fehlgeschlagen';
      }
    } catch (error) {
      console.error('Es gab ein Problem mit der anlegen des Benutzers:', error);
      errorMessage.value = 'Es gab ein Problem mit der anlegen des Benutzers. Bitte versuche es erneut.';
    }
  };

  onMounted(() => {
    console.log('onMounted');
    getVereineList();
  });

</script>

<style>
</style>
