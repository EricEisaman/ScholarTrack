<template>
  <div class="scholar-track">
    <!-- Header with mode and class selectors -->
    <v-app-bar color="primary" dark>
      <v-container class="d-flex align-center py-1 pt-8" style="min-height: 64px;">
        <!-- Mode Selector -->
        <v-select
          v-model="store.tempMode"
          :items="availableModes"
          label="Mode"
          variant="outlined"
          density="default"
          class="mr-4 mb-1"
          style="max-width: 200px"
          @update:model-value="showModeChangeModal"
        />
        
        <v-spacer />
        
        <!-- Class Selector -->
        <v-select
          v-model="store.tempClass"
          :items="classNames"
          label="Class"
          variant="outlined"
          density="default"
          class="mr-4 mb-1"
          style="max-width: 200px"
          @update:model-value="showClassChangeModal"
        />
        
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
      </v-container>
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
  } catch (error) {
    console.error('Manual sync failed:', error)
  } finally {
    isSyncing.value = false
  }
}

// Initialize app
onMounted(async () => {
  try {
    await store.initDB()
  } catch (error) {
    console.error('Failed to initialize app:', error)
    // App will still work with empty data
  }
})
</script>

<style scoped>
.scholar-track {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
