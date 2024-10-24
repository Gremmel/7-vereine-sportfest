<template>
  <header class="app-header">
    <div v-if="showHeader">
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/login">Login</RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
  import { RouterLink } from 'vue-router'
  import { ref } from 'vue'

  const showHeader = ref(true);
</script>

<style scoped>
</style>
