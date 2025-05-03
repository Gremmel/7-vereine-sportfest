<template>
  <main>
    <div class="mt-4 container">
      <h5 class="card-title">Dateien</h5>
      <!-- Dropzone -->
      <div class="card-body dropzone" :class="{ 'drag-hover': isDragHover }" @dragover.prevent="handleDragOver"
        @dragleave="handleDragLeave" @drop="handleDrop" @click="triggerFileInput">
        <p class="card-text">
          Ziehe Dateien hierher oder klicke, um Dateien hochzuladen:
        </p>
        <input type="file" ref="fileInput" @change="onFileChange" multiple class="file-input" />
      </div>
      <!-- Dateiliste -->
      <div class="mt-4">
        <h5 class="mb-3">Hochgeladene Dateien</h5>
        <table class="table table-striped">
          <thead>
            <tr>
              <th scope="col">Beschreibung</th>
              <th scope="col">Originalname</th>
              <th scope="col">Sportfest</th>
              <th scope="col">Auf Startseite</th>
              <th scope="col">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="file in fileListShow" :key="file.name">
              <td>
                <input type="text" v-model="file.name" class="form-control me-2" @blur="updateFile(file)" />
              </td>
              <td>
                <span>{{ file.orgname }}</span>
              </td>
              <td>
                <select class="form-select" v-model="file.sportfestId" @change="updateFile(file)">
                  <option value=""></option>
                  <option v-for="sportfest in sportfestList" :key="sportfest.id" :value="sportfest.id">
                  {{ sportfest.name }}
                  </option>
                </select>
              </td>
              <td>
                <i
                  v-if="file.oeffentlich == 0"
                  @click="clickOeffentlich(file, true)"
                  class="bi bi-x-circle"
                  style="cursor: pointer; font-size: 1.5em;">
                </i>
                <i
                  v-if="file.oeffentlich == 1"
                  @click="clickOeffentlich(file, false)"
                    class="bi bi-check-circle-fill text-success"
                  style="cursor: pointer; font-size: 1.5em;">
                </i>
              </td>
              <td>
                <div class="button-group">
                  <button class="btn btn-secondary btn me-2" @click="downloadFile(file)">
                    <i class="bi bi-download"></i>
                  </button>
                  <button class="btn btn-danger btn" @click="deleteFile(file)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
  import { onMounted, ref, reactive, computed } from 'vue';
  import { useRouter } from 'vue-router';
  import { useUserStore } from '@/stores/userStore';
  import { useDialogStore } from '@/stores/dialogStore';

  const dialogStore = useDialogStore();
  const userStore = useUserStore();
  const router = useRouter();

  const sportfestList = reactive([]);
  const selectedFiles = ref([]);
  const fileInput = ref(null);
  const isDragHover = ref(false);
  const fileList = reactive([]);
  let delFileId = null

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

  const clickOeffentlich = (file, oeffentlich) => {
    console.log('clickOeffentlich', file, oeffentlich);
    file.oeffentlich = oeffentlich === false ? '0' : '1';
    updateFile(file);

    for (const fileItem of fileList) {
      if (fileItem.id === file.id) {
        fileItem.oeffentlich = oeffentlich === false ? '0' : '1';
      }
    }
  };

  // Datei löschen
  const deleteFileConfirmed = async () => {
    console.log(' deleteFileConfirmed', delFileId);

    try {
      const response = await fetch('/api/delFile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileId: delFileId
        }),
        credentials: 'include'  // Cookies mitsenden
      });

      if (response.ok) {
        for (const file of fileList) {
          if (file.id === delFileId) {
            fileList.splice(fileList.indexOf(file), 1);
            break;
          }
        }
      } else {
        setTimeout(() => {
          dialogStore.setParameter('Fehlercode 117', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
        }, 1000);
      }
    } catch (error) {
      console.error('Es gab ein Problem mit dem löschen der Datei:', error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 118', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  };

  const deleteFile = (file) => {
    console.log('deleteFile', file);
    delFileId = file.id;
    dialogStore.setParameter(
      'Datei löschen',
      `Willst du die Datei <b>${file.name}</b> wirklich löschen?`,
      'Löschen',
      'btn-danger',
      'Abbrechen',
      null,
      deleteFileConfirmed
    );
  };

  const downloadFile = (file) => {
    const url = `/api/downloadFile/${file.id}`;
    window.open(url, '_blank'); // Öffnet die Datei in einem neuen Tab oder zeigt den Speichern-Dialog an
  };

  const updateFile = async (file) => {
    try {
      console.log('updateFile file', file);
      const response = await fetch(`/api/updateFile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',  // Cookies mitsenden
        body: JSON.stringify(file)
      });

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren der Datei.');
      }

      const data = await response.json();
      console.log('Datei erfolgreich aktualisiert:', data);

      if (response.ok && data) {
        //
      } else if (response.status === 401) {
        // weiterleiten zum login
        await userStore.logout()
        userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');
        router.push('/login');
      } else {
        throw new Error('Fehler beim Aktualisieren der Datei.');
      }
    } catch (error) {
      console.error(error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 119', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  };

  async function getSportfestList() {
    try {
      let response;

      response = await fetch(`/api/getSportfestList`, {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();

      if (response.ok) {
        sportfestList.splice(0);

        for (const sportfest of result.sportfestList) {
          sportfest.editMode = false;
          sportfest.startdate = sportfest.startdate ? new Date(sportfest.startdate).toISOString().split('T')[0] : '';
          sportfest.meldeende = sportfest.meldeende ? new Date(sportfest.meldeende).toISOString().split('T')[0] : '';
          sportfestList.push(sportfest);
        }
      } else if (response.status === 401) {
        // Benutzer aus dem Store entfernen
        await userStore.logout()

        userStore.setMessage('Session ist abgelaufen bitte neu Anmelden');

        // weiterleiten zum login
        router.push('/login');
      } else {
        setTimeout(() => {
          dialogStore.setParameter('Fehlercode 120', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
        }, 1000);
        console.log(result.message || 'keine Daten vorhanden');
      }
    } catch (error) {
      console.error('Es gab ein Problem mit dem Abrufen der getSportfestList:', error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 121', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  }


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
        credentials: 'include'  // Cookies mitsenden
      });

      if (!response.ok) {
        throw new Error('Fehler beim Hochladen der Dateien.');
      }

      const data = await response.json();
      console.log('Datei erfolgreich hochgeladens:', data);
      // Dateiliste neu laden
      getFileList();
      selectedFiles.value = [];
    } catch (error) {
      console.error(error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 122', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  };

  const getFileList = async () => {
    try {
      const response = await fetch(`/api/getFileList`, {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });

      const data = await response.json();

      console.log('Dateien:', data);


      if (response.ok && data) {
        fileList.splice(0); // Vorherige Dateien löschen
        for (const file of data.fileList) {
          fileList.push(file);
        }
        fileList.sort((a, b) => a.name.localeCompare(b.name));
      } else if (response.status === 401) {
        dialogStore.setParameter('Fehlercode 123', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
      } else {
        throw new Error('Fehler beim Abrufen der Dateien.');
      }

    } catch (error) {
      console.error(error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 124', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  };

  const fileListShow = computed(() => {
    const result = [];
    for (const file of fileList) {
      result.push({
        ...file
      });
    }

    return result;
  });

  onMounted(() => {
    console.log('onMounted');
    // Dateien abfragen
    getFileList();
    getSportfestList();
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

.button-group {
  display: flex;
  flex-wrap: nowrap;
  gap: 2px; /* Abstand zwischen den Buttons */
}
</style>