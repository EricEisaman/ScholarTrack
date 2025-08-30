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
          background: '#F5F5F5',
          surface: '#FFFFFF',
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

// Theme will be applied by ThemeProvider component

app.mount('#app');
