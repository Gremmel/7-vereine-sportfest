import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// import socketPlugin from './plugins/socketPlugin';

import App from './App.vue'
import router from './router'

const app = createApp(App)

// app.use(socketPlugin);
app.use(createPinia())
app.use(router)

app.mount('#app')
