<template>
  <div class="container mt-5">
    <h2>Benutzer ändern</h2>
    <div>
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
          autocomplete="new-password"
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
          autocomplete="new-password"
          required
        />
      </div>

      <div v-if="!passwordCheck" class="text-danger m-2">Passwort wiederholung ist nicht korrekt</div>

      <div class="mb-3">
        <label for="roles" class="form-label">Rollen</label>
        <select
          id="roles"
          v-model="form.selectedRoles"
          class="form-select"
          multiple
        >
          <option value="admin">Admin</option>
          <option value="benutzer" selected>Benutzer</option>
        </select>
      </div>

      <div class="mb-3 form-check">
        <input
          type="checkbox"
          id="enabled"
          v-model="form.enabled"
          class="form-check-input"
          :true-value="'1'"
          :false-value="'0'"
        />
        <label for="enabled" class="form-check-label">Aktiviert</label>
      </div>

      <button @click="clickUserEdit" type="button" :disabled="disabledSubmit" class="btn btn-primary">Benutzer ändern</button>

      <div class="m-2 text-danger" v-if="errorMessage">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
  import { onMounted, reactive, ref, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';
  import { useDialogStore } from '@/stores/dialogStore';

  const userStore = useUserStore();
  const form = ref({
    id: userStore.editUser.id,
    username: userStore.editUser.username,
    email: userStore.editUser.email,
    telefon: userStore.editUser.telefon,
    selectedRoles: userStore.editUser.parsedRoles,
    enabled: userStore.editUser.enabled,
    password: '',
    password2: '',
    vereinsId: userStore.editUser.verein.vereinsId
  });

  const router = useRouter();
  const dialogStore = useDialogStore();
  const errorMessage = ref('');
  const submitted = ref(false);
  const passwordCheck = computed(() => form.value.password === form.value.password2);
  const disabledSubmit = computed(() => {
    if (form.value.username === '' || form.value.email === '' || !passwordCheck.value) {
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
        dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      } else {
        setTimeout(() => {
          dialogStore.setParameter('Fehlercode xxx', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
        }, 1000);
        console.log(result.message || 'keine Daten vorhanden');
      }
    } catch (error) {
      console.error('Es gab ein Problem mit dem Abrufen der getVereineList:', error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  }

  async function clickUserEdit () {
    submitted.value = true;

    try {
      const response = await fetch('/api/updateUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: form.value.id,
          username: form.value.username,
          email: form.value.email,
          telefon: form.value.telefon,
          vereinsId: form.value.vereinsId,
          password: form.value.password,
          roles: JSON.stringify(form.value.selectedRoles),
          enabled: form.value.enabled
        }),
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();
      console.log('response', response);

      if (response.ok) {
        errorMessage.value = '';
        // wenn der eigene Benutzer geändert wird, hinweis das die änderungen erst nach einem erneuten login wirksam werden
        if (userStore.user.id === form.value.id) {
          dialogStore.setParameter('Hinweis', 'Die Änderungen werden erst nach erneutem Anmelden wirksam', 'ok', null, '', null, null);
        }

        // benuterdaten aus stor löschen
        userStore.clearEditUser();

        // Weiterleitung nach erfolgreichem ändern
        router.push('/users');
      } else if (response.status === 401) {
        // Benutzer aus dem Store entfernen
        userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

        await userStore.logout()

        router.push('/login');
      } else {
        errorMessage.value = result.message || 'anlegen des Benutzers fehlgeschlagen';
      }
    } catch (error) {
      console.error('Es gab ein Problem mit der anlegen des Benutzers:', error);
      errorMessage.value = 'Es gab ein Problem mit dem ändern des Benutzers. Bitte versuche es erneut: ' + error;
    }
  };

  onMounted(() => {
    console.log('onMounted');
    getVereineList();
  });
</script>

<style>
</style>
