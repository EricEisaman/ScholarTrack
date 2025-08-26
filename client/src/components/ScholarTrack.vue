<template>
  <div class="h-100 d-flex flex-column">
    <!-- Header with mode and class selectors -->
    <v-app-bar color="primary" dark>
      <v-row class="d-flex align-center py-1 pt-8 min-height-64 px-4">
        <v-col class="d-flex align-center">
          <!-- Mode Selector -->
          <v-select
            v-model="store.tempMode"
            :items="availableModesWithIcons"
            item-title="title"
            item-value="value"
            label="Mode"
            variant="outlined"
            density="default"
            class="mr-4 mb-1 max-width-200"
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
          
          <v-spacer />
          
          <!-- Class Selector -->
          <v-select
            v-model="store.tempClass"
            :items="classNamesWithIcons"
            item-title="title"
            item-value="value"
            label="Class"
            variant="outlined"
            density="default"
            class="mr-4 mb-1 max-width-200"
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
          
          <v-chip color="secondary" class="text-caption">
            {{ store.currentMode }}
          </v-chip>
          
          <v-btn
            icon
            size="small"
            color="info"
            class="ml-2"
            @click="manualSync"
            :loading="isSyncing"
            title="Sync to server"
          >
            <v-icon>mdi-sync</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-app-bar>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
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
import { computed, onMounted, ref } from 'vue'
import { useAppStore } from '../stores/appStore.ts'
import type { AppMode } from '../types'
import ModeChangeModal from './modals/ModeChangeModal.vue'
import ClassChangeModal from './modals/ClassChangeModal.vue'
import StudentModal from './modals/StudentModal.vue'
import PWAUpdatePrompt from './PWAUpdatePrompt.vue'

import StandardMode from './modes/StandardMode.vue'
import ManageClassesMode from './modes/ManageClassesMode.vue'
import ManageStudentsMode from './modes/ManageStudentsMode.vue'
import ReportsMode from './modes/ReportsMode.vue'
import StyleSettingsMode from './modes/StyleSettingsMode.vue'

const store = useAppStore()

// Local state
const isSyncing = ref(false)

// Available modes
const availableModes: AppMode[] = [
  'STANDARD',
  'MANAGE CLASSES',
  'MANAGE STUDENTS',
  'REPORTS',
  'STYLE SETTINGS'
]

// Class names for selector
const classNames = computed(() => 
  store.classes.map(c => c.name)
)

// Available modes with icons
const availableModesWithIcons = computed(() => [
  { title: 'STANDARD', value: 'STANDARD', prependIcon: 'mdi-view-dashboard' },
  { title: 'MANAGE CLASSES', value: 'MANAGE CLASSES', prependIcon: 'mdi-account-group' },
  { title: 'MANAGE STUDENTS', value: 'MANAGE STUDENTS', prependIcon: 'mdi-account-multiple' },
  { title: 'REPORTS', value: 'REPORTS', prependIcon: 'mdi-chart-line' },
  { title: 'STYLE SETTINGS', value: 'STYLE SETTINGS', prependIcon: 'mdi-palette' }
])

// Class names with icons
const classNamesWithIcons = computed(() => 
  store.classes.map(c => ({
    title: c.name,
    value: c.name,
    prependIcon: 'mdi-account-group'
  }))
)

// Current mode component
const currentModeComponent = computed(() => {
  switch (store.currentMode) {
    case 'STANDARD':
      return StandardMode
    case 'MANAGE CLASSES':
      return ManageClassesMode
    case 'MANAGE STUDENTS':
      return ManageStudentsMode
    case 'REPORTS':
      return ReportsMode
    case 'STYLE SETTINGS':
      return StyleSettingsMode
    default:
      return StandardMode
  }
})

// Show mode change modal
const showModeChangeModal = (mode: AppMode) => {
  // Allow switching to STANDARD mode without teacher code
  if (mode === 'STANDARD') {
    store.currentMode = mode
  } else {
    // Require teacher code for other modes
    store.tempMode = mode
    store.showModeModal = true
  }
}

// Show class change modal
const showClassChangeModal = (className: string) => {
  store.tempClass = className
  store.showClassModal = true
}

// Manual sync to server
const manualSync = async () => {
  isSyncing.value = true
  try {
    await store.syncToServer()
  } catch (error: unknown) {
    console.error('Manual sync failed:', error)
  } finally {
    isSyncing.value = false
  }
}

// Initialize app
onMounted(async () => {
  try {
    await store.initDB()
  } catch (error: unknown) {
    console.error('Failed to initialize app:', error)
    // App will still work with empty data
  }
})
</script>


