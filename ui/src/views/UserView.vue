<template>
  <main>
    <div class="mt-4 container">
      <div class="card p-4">
        <div class="row">
          <div class="col"><h2>Benutzerliste</h2></div>
          <div class="col-auto"><button type="button" @click="goToNewUser" class="btn btn-success">Neuer Benutzer</button></div>
        </div>
        <table class="table table">
          <thead>
            <tr>
              <th scope="col">Benutzername</th>
              <th scope="col">E-Mail</th>
              <th scope="col">Aktiv</th>
              <th scope="col">Rollen</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userList" :key="user.username">
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>
                <input type="checkbox" :checked="user.enabled === '1'" disabled />
              </td>
              <td>
                <ul class="list-group list-group-flush">
                  <li v-for="role in user.parsedRoles" :key="role" class="">
                    {{ role }}
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </main>
</template>

<script setup>
  import { onMounted, reactive } from 'vue';
  import { useRouter } from 'vue-router';

  const userList = reactive([]);

  async function getUserList() {
    try {
      const response = await fetch('/api/getUserList', {
        method: 'GET',
        credentials: 'include'  // Cookies mitsenden
      });

      const result = await response.json();
      console.log('getSession result', result);

      if (response.ok) {
        for (const user of result.users) {
          userList.push(user);
        }

        for (const user of userList) {
          if (user.roles) {
            try {
              user.parsedRoles = JSON.parse(user.roles);
            } catch (error) {
              console.error('Parsen der Rollen war nicht möglich', error);
            }
          } else {
            user.parsedRoles = [];
          }
        }

      } else {
        console.log(result.message || 'keine Daten vorhanden');
      }
    } catch (error) {
      console.error('Es gab ein Problem mit dem Abrufen der getUserList:', error);
    }
  }

  onMounted(() => {
    getUserList();
  });

  const router = useRouter();
  const goToNewUser = () => {
    router.push('/newuser');
  };
</script>

<style scoped>
</style>