<template>
  <main>
    <div class="mt-4 container">
      <div class="card p-4">
      </div>
    </div>
  </main>
</template>

<script setup>
  import { onMounted, reactive, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';

  const userStore = useUserStore();
  const router = useRouter();

  onMounted(() => {
    console.log('onMounted');
  });

</script>

<style scoped>
</style>