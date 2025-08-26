<template>
  <div class="h-100 d-flex flex-column">
    <!-- Responsive Header with Dynamic Layout -->
    <v-app-bar color="primary" dark>
      <!-- Desktop Layout (md and up) -->
      <div v-if="!smAndDown" class="d-flex align-center w-100">
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
              class="mr-4 mb-1"
              :style="{ maxWidth: lgAndUp ? '200px' : '180px' }"
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
              class="mr-4 mb-1"
              :style="{ maxWidth: lgAndUp ? '200px' : '180px' }"
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
      </div>

      <!-- Mobile Layout (sm and down) -->
      <div v-else class="d-flex align-center w-100 px-2">
        <!-- Mobile Navigation Menu -->
        <v-app-bar-nav-icon @click="mobileMenuOpen = !mobileMenuOpen" />
        
        <!-- App Title -->
        <v-toolbar-title class="ml-2">
          <span v-if="xs">ScholarTrack</span>
          <span v-else>ScholarTrack - {{ store.currentMode }}</span>
        </v-toolbar-title>
        
        <v-spacer />
        
        <!-- Mobile Actions -->
        <v-btn
          icon
          size="small"
          color="info"
          @click="manualSync"
          :loading="isSyncing"
          title="Sync"
        >
          <v-icon>mdi-sync</v-icon>
        </v-btn>
        
        <!-- Mobile Menu -->
        <v-menu
          v-model="mobileMenuOpen"
          :location="xs ? 'bottom' : 'bottom end'"
          :close-on-content-click="false"
        >
          <v-card min-width="280">
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
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
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
import ResponsiveShowcase from './ResponsiveShowcase.vue'

const store = useAppStore()
const { mdAndUp, smAndDown, lgAndUp, xs, sm } = useDisplay()

// Local state
const isSyncing = ref(false)
const mobileMenuOpen = ref(false)

// Available modes
const availableModes: AppMode[] = [
  'STANDARD',
  'MANAGE CLASSES',
  'MANAGE STUDENTS',
  'REPORTS',
  'STYLE SETTINGS',
  'RESPONSIVE SHOWCASE'
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
  { title: 'STYLE SETTINGS', value: 'STYLE SETTINGS', prependIcon: 'mdi-palette' },
  { title: 'RESPONSIVE SHOWCASE', value: 'RESPONSIVE SHOWCASE', prependIcon: 'mdi-responsive' }
])

// Class names with icons
const classNamesWithIcons = computed(() => 
  store.classes.map(c => ({
    title: c.name,
    value: c.name,
    prependIcon: 'mdi-account-group'
  }))
)

// Current class students count
const currentClassStudentsCount = computed(() => 
  store.currentClassStudents.length
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
    case 'RESPONSIVE SHOWCASE':
      return ResponsiveShowcase
    default:
      return StandardMode
  }
})

// Show mode change modal
const showModeChangeModal = (mode: AppMode) => {
  // Close mobile menu
  mobileMenuOpen.value = false
  
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
  // Close mobile menu
  mobileMenuOpen.value = false
  
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


