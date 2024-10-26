<script setup>
// socket io verbindung test
// import { ref, onMounted, getCurrentInstance } from 'vue';

// const message = ref('noch nichts neues');

// onMounted(() => {
//   // Zugriff auf den globalen Socket-Service über proxy.$socket
//   const { proxy } = getCurrentInstance();

//   const handleMessage = (data) => {
//     message.value = data.msg;
//   };

//   proxy.$socket.sendMessage('HomeView', {
//     callFunction: 'init',
//     payload: 'Hallo vom Client'
//   });

//   proxy.$socket.onMessage('initHome', handleMessage);
// });

</script>

<template>
  <main>
    <div class="text-center mt-4">
      <h1>
        Home
      </h1>
    </div>
  </main>
</template>
