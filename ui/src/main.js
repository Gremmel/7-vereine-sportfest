import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createSessionStoragePlugin } from './plugins/piniaSessionPlugin';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
// import socketPlugin from './plugins/socketPlugin';

import App from './App.vue'
import router from './router'

const app = createApp(App)

const pinia = createPinia();
pinia.use(createSessionStoragePlugin());

// app.use(socketPlugin);
app.use(pinia)
app.use(router)

app.mount('#app')
