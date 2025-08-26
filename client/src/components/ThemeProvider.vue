<template>
  <slot />
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useTheme } from 'vuetify';

const store = useAppStore();
const theme = useTheme();

// Watch for style settings changes and update the global theme
watch(() => store.styleSettings, (settings) => {
  if (settings && theme.themes.value['light']) {
    theme.themes.value['light'].colors.primary = settings.primaryColor;
    theme.themes.value['light'].colors.secondary = settings.secondaryColor;
    console.log('Theme updated:', settings);
  }
}, { immediate: true });
</script>
