<script setup>
import TheWelcome from '../components/TheWelcome.vue'
import { ref, onMounted, getCurrentInstance } from 'vue';

const message = ref('noch nichts neues');

onMounted(() => {
  // Zugriff auf den globalen Socket-Service über proxy.$socket
  const { proxy } = getCurrentInstance();

  const handleMessage = (data) => {
    message.value = data.msg;
  };

  proxy.$socket.sendMessage('HomeView', {
    callFunction: 'init',
    payload: 'Hallo vom Client'
  });

  proxy.$socket.onMessage('initHome', handleMessage);
});

</script>

<template>
  <main>
    {{ message }}
    <TheWelcome />
  </main>
</template>
