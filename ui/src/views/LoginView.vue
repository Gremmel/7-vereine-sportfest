<template>
  <div class="d-flex justify-content-center align-items-center mt-4">
    <div class="card loginCard">
      <div class="card-header">
        <h3>
          Login
        </h3>
      </div>
      <div class="card-body">
        <div class="form-floating mb-3">
          <input v-model="username" type="text" class="form-control" id="floatingInput" placeholder="Benutzername">
          <label for="floatingInput">Benutzername</label>
        </div>
        <div class="form-floating">
          <input v-model="password" type="password" class="form-control" id="floatingPassword" placeholder="Password">
          <label for="floatingPassword">Passwort</label>
        </div>
        <button class="btn btn-success mt-2" type="button" @click="handleLogin">Login</button>
      </div>

      <p v-if="errorMessage" class="error m-3">{{ errorMessage }}</p>
      <p v-if="successMessage" class="success m-3">{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const username = ref('');
    const password = ref('');
    const errorMessage = ref('');
    const successMessage = ref('');

    const userStore = useUserStore();
    const router = useRouter();

    const handleLogin = async () => {
      try {
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username: username.value, password: password.value }),  // ref() braucht .value
          credentials: 'include'  // Cookies mitsenden
        });

        const result = await response.json();
        console.log('handleLogin response', response);

        if (response.ok) {
          successMessage.value = result.message;
          errorMessage.value = '';

          userStore.setUser({
            name: response.name,
            roles: response.roles,
          });

          // Weiterleitung nach erfolgreichem Login
          router.push('/');
        } else {
          errorMessage.value = result.message || 'Login fehlgeschlagen';
          successMessage.value = '';
        }
      } catch (error) {
        console.error('Es gab ein Problem mit der Anmeldung:', error);
        errorMessage.value = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
        successMessage.value = '';
      }
    };

    // Gebe alle Variablen und Methoden für das Template zurück
    return {
      username,
      password,
      errorMessage,
      successMessage,
      handleLogin
    };
  }
};
</script>

<style scoped>
  .loginCard {
    width: 25rem;
  }

  .error {
    color: red;
    margin-top: 10px;
  }

  .success {
    color: green;
    margin-top: 10px;
  }

</style>
