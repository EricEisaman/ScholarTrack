<template>
  <slot />
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useTheme } from 'vuetify';

const store = useAppStore();
const theme = useTheme();

// Apply theme immediately when component mounts
onMounted(() => {
  const settings = store.getStyleSettings();
  if (settings && theme.themes.value['light']) {
    theme.themes.value['light'].colors.primary = settings.primaryColor;
    theme.themes.value['light'].colors.secondary = settings.secondaryColor;
    theme.themes.value['light'].colors.background = settings.tertiaryColor;
    theme.themes.value['light'].colors.surface = settings.tertiaryColor;

    // Also apply to body immediately to prevent flash
    document.body.style.backgroundColor = settings.tertiaryColor;
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.style.backgroundColor = settings.tertiaryColor;
    }
  }
});

// Watch for style settings changes and update the global theme
watch(() => store.styleSettings, (settings) => {
  if (settings && theme.themes.value['light']) {
    theme.themes.value['light'].colors.primary = settings.primaryColor;
    theme.themes.value['light'].colors.secondary = settings.secondaryColor;
    theme.themes.value['light'].colors.background = settings.tertiaryColor;
    theme.themes.value['light'].colors.surface = settings.tertiaryColor;

    // Apply to body immediately
    document.body.style.backgroundColor = settings.tertiaryColor;
    const appElement = document.getElementById('app');
    if (appElement) {
      appElement.style.backgroundColor = settings.tertiaryColor;
    }

    console.log('Theme updated:', settings);
  }
}, { immediate: true });
</script>
