<template>
  <v-app>
    <ThemeProvider>
      <ScholarTrack />
    </ThemeProvider>
  </v-app>
</template>

<script setup lang="ts">
import ScholarTrack from './components/ScholarTrack.vue';
import ThemeProvider from './components/ThemeProvider.vue';
</script>
