import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

// Vuetify
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import '@mdi/font/css/materialdesignicons.css';

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#000000',
          surface: '#000000',
          primary: '#1976D2',
          secondary: '#424242',
        },
      },
    },
  },
});

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(vuetify);

// Apply theme immediately to prevent flash
const appElement = document.getElementById('app');
if (appElement) {
  appElement.style.backgroundColor = '#000000';
}
document.body.style.backgroundColor = '#000000';

app.mount('#app');
