import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light'
  },
  // Enhanced breakpoint configuration for educational devices
  breakpoint: {
    thresholds: {
      xs: 340,    // Small phones
      sm: 600,    // Large phones / Small tablets
      md: 960,    // Tablets / Small laptops
      lg: 1264,   // Desktop / Large tablets
      xl: 1904    // Large desktop / Interactive whiteboards
    },
    scrollBarWidth: 16,
    mobileBreakpoint: 'sm' // Consider devices below 600px as mobile
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(vuetify)

app.mount('#app')
