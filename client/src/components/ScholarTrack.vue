<template>
  <div class="h-100 d-flex flex-column">
    <!-- Responsive Header with Dynamic Layout -->
    <v-app-bar color="primary" dark>
      <!-- Desktop Layout (md and up) -->
      <div v-if="!smAndDown" class="d-flex align-center w-100 px-4 py-2">
        <!-- Left Slot: Mode Selector -->
        <div class="d-flex align-center">
          <v-select
            v-model="store.tempMode"
            :items="availableModesWithIcons"
            item-title="title"
            item-value="value"
            label="Mode"
            variant="outlined"
            density="comfortable"
            class="mr-4 mt-1 pt-3"
            :class="lgAndUp ? 'max-width-200' : 'max-width-180'"
            :menu-props="{
              maxHeight: '400px',
              location: 'bottom',
              offset: '16px'
            }"
            @update:model-value="showModeChangeModal"
          >
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="item.raw.prependIcon" />
                </template>
              </v-list-item>
            </template>
          </v-select>
        </div>

        <!-- Center Slot: Logo and School Name -->
        <div class="d-flex align-center justify-center flex-grow-1">
          <div class="d-flex align-center">
            <img
              :src="appLogo"
              alt="ScholarTrack Logo"
              class="mr-3 logo-image"
            />
            <div class="d-flex flex-column">
              <span class="text-h5 font-weight-bold">{{ schoolName }}</span>
              <span class="text-caption text-medium-emphasis">ScholarTrack</span>
            </div>
          </div>
        </div>

        <!-- Right Slot: Class Selector and Status -->
        <div class="d-flex align-center">
          <v-select
            v-model="store.tempClass"
            :items="classNamesWithIcons"
            item-title="title"
            item-value="value"
            label="Class"
            variant="outlined"
            density="comfortable"
            class="mr-4 mt-1 pt-3"
            :class="lgAndUp ? 'max-width-200' : 'max-width-180'"
            @update:model-value="showClassChangeModal"
          >
            <template #item="{ item, props }">
              <v-list-item v-bind="props">
                <template #prepend>
                  <v-icon :icon="item.raw.prependIcon" />
                </template>
              </v-list-item>
            </template>
          </v-select>

          <v-chip color="secondary" class="text-caption mr-2">
            {{ store.currentMode }}
          </v-chip>

          <!-- Authentication Status Indicator (for debugging) -->
          <v-chip
            v-if="store.isAuthenticated"
            color="success"
            size="small"
          >
            <v-icon size="small" class="mr-1">mdi-shield-check</v-icon>
            Auth
          </v-chip>
        </div>
      </div>

      <!-- Mobile Layout (sm and down) -->
      <div v-else class="d-flex align-center w-100 px-2">
        <!-- Left Slot: Mobile Navigation Menu -->
        <div class="d-flex align-center">
          <v-app-bar-nav-icon @click="mobileMenuOpen = !mobileMenuOpen" />
        </div>

        <!-- Center Slot: Logo -->
        <div class="d-flex align-center justify-center flex-grow-1">
          <div class="d-flex align-center">
            <img
              :src="appLogo"
              alt="ScholarTrack Logo"
              class="logo-image-mobile"
            />
          </div>
        </div>

        <!-- Right Slot: Mobile Menu -->
        <div class="d-flex align-center">
          <v-menu
            v-model="mobileMenuOpen"
            :location="xs ? 'bottom' : 'bottom end'"
            :close-on-content-click="false"
            :max-height="400"
          >
            <v-card min-width="280" max-height="400" class="overflow-y-auto">
              <v-list>
                <!-- Current Class Display -->
                <v-list-item>
                  <template #prepend>
                    <v-icon>mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title>{{ store.currentClass?.name || 'No Class' }}</v-list-item-title>
                  <v-list-item-subtitle>{{ currentClassStudentsCount }} Students</v-list-item-subtitle>
                </v-list-item>

                <v-divider />

                <!-- Mode Selection -->
                <v-list-subheader>Mode</v-list-subheader>
                <v-list-item
                  v-for="mode in availableModesWithIcons"
                  :key="mode.value"
                  @click="showModeChangeModal(mode.value as AppMode)"
                  :active="store.currentMode === mode.value"
                >
                  <template #prepend>
                    <v-icon :icon="mode.prependIcon" />
                  </template>
                  <v-list-item-title>{{ mode.title }}</v-list-item-title>
                </v-list-item>

                <v-divider />

                <!-- Class Selection -->
                <v-list-subheader>Class</v-list-subheader>
                <v-list-item
                  v-for="classItem in classNamesWithIcons"
                  :key="classItem.value"
                  @click="showClassChangeModal(classItem.value)"
                  :active="store.currentClass?.name === classItem.value"
                >
                  <template #prepend>
                    <v-icon :icon="classItem.prependIcon" />
                  </template>
                  <v-list-item-title>{{ classItem.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card>
          </v-menu>
        </div>
      </div>
    </v-app-bar>

    <!-- Main Content with Responsive Container -->
    <v-main>
      <v-container
        fluid
        :class="{
          'pa-2': xs,
          'pa-4': sm,
          'pa-6': mdAndUp
        }"
      >
        <!-- Mode-specific content -->
        <component :is="currentModeComponent" />
      </v-container>
    </v-main>

    <!-- Modals -->
    <ModeChangeModal />
    <ClassChangeModal />
    <StudentModal />

    <!-- PWA Update Prompt -->
    <PWAUpdatePrompt />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useAppStore } from '../stores/appStore.ts';
import type { AppMode } from '../types';
import ModeChangeModal from './modals/ModeChangeModal.vue';
import ClassChangeModal from './modals/ClassChangeModal.vue';
import StudentModal from './modals/StudentModal.vue';
import PWAUpdatePrompt from './PWAUpdatePrompt.vue';

import StandardMode from './modes/StandardMode.vue';
import ManageClassesMode from './modes/ManageClassesMode.vue';
import ManageStudentsMode from './modes/ManageStudentsMode.vue';
import ManageTransactionsMode from './modes/ManageTransactionsMode.vue';
import ReportsMode from './modes/ReportsMode.vue';
import StyleSettingsMode from './modes/StyleSettingsMode.vue';
import ResponsiveShowcase from './ResponsiveShowcase.vue';
import NetworkSettingsMode from './modes/NetworkSettingsMode.vue';

const store = useAppStore();
const { mdAndUp, smAndDown, lgAndUp, xs, sm } = useDisplay();

// Local state
const mobileMenuOpen = ref(false);

// Available modes with icons
const availableModesWithIcons = computed(() => [
  { title: 'STANDARD', value: 'STANDARD', prependIcon: 'mdi-view-dashboard' },
  { title: 'MANAGE CLASSES', value: 'MANAGE CLASSES', prependIcon: 'mdi-account-group' },
  { title: 'MANAGE STUDENTS', value: 'MANAGE STUDENTS', prependIcon: 'mdi-account-multiple' },
  { title: 'MANAGE TRANSACTIONS', value: 'MANAGE TRANSACTIONS', prependIcon: 'mdi-cog' },
  { title: 'REPORTS', value: 'REPORTS', prependIcon: 'mdi-chart-line' },
  { title: 'STYLE SETTINGS', value: 'STYLE SETTINGS', prependIcon: 'mdi-palette' },
  { title: 'RESPONSIVE SHOWCASE', value: 'RESPONSIVE SHOWCASE', prependIcon: 'mdi-responsive' },
  { title: 'NETWORK SETTINGS', value: 'NETWORK SETTINGS', prependIcon: 'mdi-wifi' },
]);

// Class names with icons
const classNamesWithIcons = computed(() =>
  store.classes.map(c => ({
    title: c.name,
    value: c.name,
    prependIcon: 'mdi-account-group',
  })),
);

// Current class students count
const currentClassStudentsCount = computed(() =>
  store.currentClassStudents.length,
);

// App logo - use custom logo if available, otherwise use default
const appLogo = computed(() => {
  const settings = store.getStyleSettings();
  return settings?.logoImage || '/icons/icon-512x512.png';
});

// School name - use custom name if available, otherwise use default
const schoolName = computed(() => {
  const settings = store.getStyleSettings();
  return settings?.schoolName || 'ScholarTrack';
});

// Current mode component
const currentModeComponent = computed(() => {
  switch (store.currentMode) {
  case 'STANDARD':
    return StandardMode;
  case 'MANAGE CLASSES':
    return ManageClassesMode;
  case 'MANAGE STUDENTS':
    return ManageStudentsMode;
  case 'MANAGE TRANSACTIONS':
    return ManageTransactionsMode;
  case 'REPORTS':
    return ReportsMode;
  case 'STYLE SETTINGS':
    return StyleSettingsMode;
  case 'RESPONSIVE SHOWCASE':
    return ResponsiveShowcase;
  case 'NETWORK SETTINGS':
    return NetworkSettingsMode;
  default:
    return StandardMode;
  }
});

// Show mode change modal
const showModeChangeModal = async (mode: AppMode) => {
  // Close mobile menu
  mobileMenuOpen.value = false;

  // Use the new switchMode function that handles authentication properly
  await store.switchMode(mode);
};

// Show class change modal
const showClassChangeModal = (className: string) => {
  // Close mobile menu
  mobileMenuOpen.value = false;

  store.tempClass = className;
  store.showClassModal = true;
};

// Initialize app
onMounted(async () => {
  try {
    await store.initDB();
  } catch (error: unknown) {
    console.error('Failed to initialize app:', error);
    // App will still work with empty data
  }
});
</script>

<style scoped>
.max-width-200 {
  max-width: 200px;
}

.max-width-180 {
  max-width: 180px;
}

.logo-image {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-image-mobile {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
</style>

