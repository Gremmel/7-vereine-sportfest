<template>
  <div class="login-container">
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <label for="username">Benutzername:</label>
      <input type="text" v-model="username" id="username" required>

      <label for="password">Passwort:</label>
      <input type="password" v-model="password" id="password" required>

      <button type="submit">Login</button>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="success">{{ successMessage }}</p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const username = ref('');  // v-model gebunden
    const password = ref('');  // v-model gebunden
    const errorMessage = ref('');
    const successMessage = ref('');

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

        if (response.ok) {
          successMessage.value = result.message;
          errorMessage.value = '';
          // Optional: Weiterleitung nach erfolgreichem Login
          // this.$router.push('/dashboard');
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
.login-container {
  max-width: 300px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

input {
  display: block;
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
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
