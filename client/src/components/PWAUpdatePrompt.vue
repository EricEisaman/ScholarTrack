<template>
  <v-snackbar
    v-model="showUpdatePrompt"
    :timeout="-1"
    color="primary"
    location="top"
  >
    <div class="d-flex align-center">
      <v-icon class="mr-2">
        mdi-update
      </v-icon>
      <span>A new version of ScholarTrack is available</span>
    </div>

    <template #actions>
      <v-btn
        color="white"
        variant="text"
        @click="updateApp"
      >
        Update
      </v-btn>
      <v-btn
        color="white"
        variant="text"
        @click="dismissUpdate"
      >
        Later
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const showUpdatePrompt = ref(false);
let updateCallback: (() => void) | null = null;

onMounted((): void => {
  // Listen for PWA update events
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', (): void => {
      // New service worker activated, prompt for reload
      showUpdatePrompt.value = true;
      updateCallback = (): void => {
        window.location.reload();
      };
    });
  }
});

const updateApp = (): void => {
  if (updateCallback) {
    updateCallback();
  }
  showUpdatePrompt.value = false;
};

const dismissUpdate = (): void => {
  showUpdatePrompt.value = false;
};
</script>
