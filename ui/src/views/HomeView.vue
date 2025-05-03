<template>
  <main>
    <div class="container mt-3" id="home">
      <!-- Bilder -->
      <div id="carouselHome" class="carousel slide carousel-fade" data-bs-ride="carousel">
        <div class="carousel-inner">
          <div class="carousel-item active" data-bs-interval="5000">
            <img src="@/assets/7vereine_ca.png" class="d-block w-100" alt="7 Vereine">
          </div>
          <div class="carousel-item">
            <img src="@/assets/001-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
          <div class="carousel-item">
            <img src="@/assets/002-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
          <div class="carousel-item">
            <img src="@/assets/003-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
          <div class="carousel-item">
            <img src="@/assets/004-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
          <div class="carousel-item">
            <img src="@/assets/005-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
          <div class="carousel-item">
            <img src="@/assets/006-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
          <div class="carousel-item">
            <img src="@/assets/007-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
          <div class="carousel-item">
            <img src="@/assets/008-2000x600.jpg" class="d-block w-100" alt="..." loading="lazy">
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselHome" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselHome" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
      <!-- Sportfest auflistung Aktuelle-->
      <div>
        <h4 class="mt-3">Aktuelle Sportfeste</h4>
        <div class="row">
          <div v-for="sportfest in sportfestListZukunftShow" :key="sportfest.id" class="col mb-3">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ sportfest.name }}</h5>
                <div v-if="sportfest.description && !sportfest.showDescriptionEdit" class="card-text text-dark p-2 mb-1"
                  style="background-color: #f2f2f2;">
                  <strong>{{ sportfest.description }}</strong>
                </div>
                <div v-if="sportfest.showDescriptionEdit" class="card-text text-dark p-2 mb-1"
                  style="background-color: #f2f2f2;">
                  <textarea class="form-control" @blur="blurSprotfestDescription(sportfest)"
                    v-model="sportfest.description"></textarea>
                </div>
                <p class="card-text">
                  <small class="text-muted">Datum: </small>
                  <small>{{ sportfest.startDateDE }} Uhr</small>
                </p>
                <p class="card-text">
                  <small class="text-muted">Meldeende: </small>
                  <small>{{ sportfest.meldeendeDE }}</small>
                </p>
                <p class="card-text">
                  <small class="text-muted">Ort: </small>
                  <small v-html="sportfest.ort"></small>
                </p>
                <p class="card-text"><small class="text-muted">Administrativer Verein: </small><small>{{
                  sportfest.admin_verein_name }}</small></p>
                <div>
                  Beteiligte Vereine:
                  <p class="card-text"><small class="text-muted">{{ sportfest.sportfestListString }}</small></p>
                </div>
                <div v-if="sportfest.fileList.length > 0">
                  Dateien:
                  <ul>
                    <li v-for="file in sportfest.fileList" :key="file.id">
                      <a :href="`/api/downloadFile/${file.id}`" target="_blank">{{ file.name }}</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Allgemeine Dateie -->
      <div v-if="fileListOhneSportfestId.length > 0" class="mb-3">
        <h4 class="mt-3">Allgemeine Dateien</h4>
        <div class="card">
          <div class="list-group">
            <a v-for="file in fileListOhneSportfestId" :key="file.id" class="list-group-item list-group-item-action"
              :href="`/api/downloadFile/${file.id}`" target="_blank">{{ file.name }}</a>
          </div>
        </div>
      </div>
    </div>
  </main>
  <footer class="bg-dark text-white text-center py-3 mt-4">
    <div class="container">
      <a href="/impressum" class="text-white me-3">Impressum / Datenschutz</a>
    </div>
  </footer>
</template>

<script setup>
  import { onMounted, reactive, computed } from 'vue';
  import { Carousel } from 'bootstrap'; // Importiere nur die Carousel-Komponente von Bootstrap

  import { useUserStore } from '@/stores/userStore';
  const userStore = useUserStore();

  import { useDialogStore } from '@/stores/dialogStore';
  const dialogStore = useDialogStore();

  const sportfestList = reactive([]);
  const fileList = reactive([]);
  const vereineList = reactive([]);

  const fileListOhneSportfestId = computed(() => {
    return fileList.filter(file => !file.sportfestId);
  });

  const sportfestListZukunftShow = computed(() => {
    const list = [];

    for (const sportfest of sportfestList) {
      const startDate = new Date(sportfest.startdate);
      const currentDate = new Date();

      sportfest.vereineList = sportfest.vereine.split(',');
      sportfest.vereineList.sort((a, b) => a.localeCompare(b));
      sportfest.sportfestListString = sportfest.vereineList.join(', ');
      sportfest.startDateDE = new Date(sportfest.startdate).toLocaleString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
      sportfest.meldeendeDE = new Date(sportfest.meldeende).toLocaleDateString('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });

      if (sportfest.admin_verein_id === userStore?.user?.verein_id) {
        sportfest.showDescriptionEdit = true;
      } else {
        sportfest.showDescriptionEdit = false;
      }

      sportfest.fileList = [];

      for (const file of fileList) {
        if (file.sportfestId === sportfest.id) {
          sportfest.fileList.push(file);
        }
      }

      if (startDate >= currentDate) {
        list.push(sportfest);
      }

    }
    return list;
  });

  const blurSprotfestDescription = async (sportfest) => {
    console.log('blurSportfestDescription sportfest', sportfest);

    try {
      const response = await fetch('/api/editDescriptionSportfest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sportfest }),
        credentials: 'include'  // Cookies mitsenden
      });

      if (!response.ok) {
        setTimeout(() => {
          dialogStore.setParameter('Fehlercode 125', `${response.status} ${response.statusText}`, 'ok', null, '', null, null);
        }, 1000);
      }
    } catch (error) {
      console.error('Es gab ein Problem beim Aendern des Sportfestes', error);
      setTimeout(() => {
        dialogStore.setParameter('Fehlercode 126', `${error.message}`, 'ok', null, '', null, null);
      }, 1000);
    }
  };

  const getData = async () => {
    try {
      const response = await fetch(`/api/getDataHome`, {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });

      const data = await response.json();

      console.log('data:', data);


      if (response.ok && data) {
        fileList.splice(0);
        vereineList.splice(0);
        sportfestList.splice(0);

        if (data.sportfestList) {
          for (const sportfest of data.sportfestList) {
            sportfestList.push(sportfest);
          }
        }
        if (data.vereineList) {
          for (const vereine of data.vereineList) {
            vereineList.push(vereine);
          }
        }
        if (data.fileList) {
          for (const file of data.fileList) {
            fileList.push(file);
          }
        }
        fileList.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        throw new Error('Fehler beim Abrufen der Dateien.');
      }

    } catch (error) {
      console.error(error);
    }
  };

  onMounted(() => {
    console.log('onMounted');
    // Dateien abfragen
    getData();

    const carouselElement = document.getElementById('carouselHome');
    if (carouselElement) {
      new Carousel(carouselElement); // Initialisiere das Carousel
    }
  });
</script>

<style scoped>
html, body {
  height: 100%; /* Stellt sicher, dass der Body die volle Höhe des Fensters einnimmt */
  margin: 0;
}

#home {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 9.5rem); /* Stellt sicher, dass der Inhalt mindestens die Fensterhöhe einnimmt */
}

main {
  flex: 1; /* Nimmt den verfügbaren Platz ein */
}

footer {
  background-color: #343a40; /* Optional: Hintergrundfarbe des Footers */
  color: white; /* Optional: Textfarbe des Footers */
  text-align: center;
  padding: 1rem 0;
}
</style>