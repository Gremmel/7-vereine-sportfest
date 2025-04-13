<template>
  <main>
    <div class="mt-4 container">
      <h5 class="card-title">Dateien</h5>
      <div
        class="card-body dropzone"
        :class="{ 'drag-hover': isDragHover }"
        @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
        @click="triggerFileInput"
      >
        <p class="card-text">
          Ziehe Dateien hierher oder klicke, um Dateien hochzuladen:
        </p>
        <input
          type="file"
          ref="fileInput"
          @change="onFileChange"
          multiple
          class="file-input"
        />
      </div>
    </div>
  </main>
</template>

<script setup>
  import { onMounted, ref } from 'vue';
  // import { useRouter } from 'vue-router';
  // import { useUserStore } from '@/stores/userStore';
  import { useDialogStore } from '@/stores/dialogStore';

  const dialogStore = useDialogStore();
  // const userStore = useUserStore();
  // const router = useRouter();

  const selectedFiles = ref([]);
  const fileInput = ref(null);
  const isDragHover = ref(false);

  const onFileChange = (event) => {
    selectedFiles.value = Array.from(event.target.files);
    uploadFiles();
  };

  const handleDrop = (event) => {
    event.preventDefault(); // Verhindert das Standardverhalten (z. B. Öffnen der Datei)
    event.stopPropagation(); // Stoppt die weitere Verarbeitung des Events

    console.log('handleDrop event.dataTransfer.files', event.dataTransfer.files);
    const files = Array.from(event.dataTransfer.files);
    selectedFiles.value = files;
    uploadFiles();
    isDragHover.value = false; // Hover-Zustand deaktivieren
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    isDragHover.value = true; // Hover-Zustand aktivieren
  };

  const handleDragLeave = () => {
    isDragHover.value = false; // Hover-Zustand deaktivieren
  };

  const triggerFileInput = () => {
    if (fileInput.value) {
      fileInput.value.click();
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.value.length === 0) {
      alert('Keine Dateien ausgewählt.');
      return;
    }

    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Fehler beim Hochladen der Dateien.');
      }

      const data = await response.json();
      console.log('Datei erfolgreich hochgeladens:', data);
      selectedFiles.value = [];
    } catch (error) {
      console.error(error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode xxx', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  };

  onMounted(() => {
    console.log('onMounted');
  });

</script>

<style scoped>
.dropzone {
  border: 4px dashed #cbcbcb;
  border-radius: 20px;
  padding: 20px;
  margin: 20px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.dropzone:hover,
.dropzone.drag-hover{
  background-color: #ececec;
}

.file-input {
  display: none;
}
</style>