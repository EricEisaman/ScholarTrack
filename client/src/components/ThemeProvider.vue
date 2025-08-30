<template>
  <slot />
</template>

<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useAppStore } from '../stores/appStore';
import { useTheme } from 'vuetify';
import { componentLogger } from '../services/logger';

const store = useAppStore();
const theme = useTheme();

// Apply theme immediately when component mounts
onMounted(() => {
  const settings = store.getStyleSettings();
  if (settings && theme.themes.value['light']) {
    theme.themes.value['light'].colors.primary = settings.primaryColor;
    theme.themes.value['light'].colors.secondary = settings.secondaryColor;
    theme.themes.value['light'].colors.background = settings.pageBackgroundColor;
    theme.themes.value['light'].colors.surface = settings.tertiaryColor;
  }
});

// Watch for style settings changes and update the global theme
watch(() => store.styleSettings, (settings) => {
  if (settings && theme.themes.value['light']) {
    theme.themes.value['light'].colors.primary = settings.primaryColor;
    theme.themes.value['light'].colors.secondary = settings.secondaryColor;
    theme.themes.value['light'].colors.background = settings.pageBackgroundColor;
    theme.themes.value['light'].colors.surface = settings.tertiaryColor;

    componentLogger.info('ThemeProvider', 'Theme updated', settings);
  }
}, { immediate: true });
</script>
