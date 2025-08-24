<template>
  <div class="scholar-track">
    <!-- Header with mode and class selectors -->
    <v-app-bar color="primary" dark>
      <v-container class="d-flex align-center">
        <!-- Mode Selector -->
        <v-select
          v-model="tempMode"
          :items="availableModes"
          label="Mode"
          variant="outlined"
          density="compact"
          class="mr-4"
          style="max-width: 200px"
          @update:model-value="showModeChangeModal"
        />
        
        <v-spacer />
        
        <!-- Class Selector -->
        <v-select
          v-model="tempClass"
          :items="classNames"
          label="Class"
          variant="outlined"
          density="compact"
          class="mr-4"
          style="max-width: 200px"
          @update:model-value="showClassChangeModal"
        />
        
        <v-chip color="secondary" class="text-caption">
          {{ currentMode }}
        </v-chip>
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
    <AddClassModal />
    <AddStudentModal />
    <EditStudentModal />
    <RemoveStudentModal />
    <ReportsModal />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'
import type { AppMode } from '../types'
import ModeChangeModal from './modals/ModeChangeModal.vue'
import ClassChangeModal from './modals/ClassChangeModal.vue'
import StudentModal from './modals/StudentModal.vue'
import AddClassModal from './modals/AddClassModal.vue'
import AddStudentModal from './modals/AddStudentModal.vue'
import EditStudentModal from './modals/EditStudentModal.vue'
import RemoveStudentModal from './modals/RemoveStudentModal.vue'
import ReportsModal from './modals/ReportsModal.vue'
import StandardMode from './modes/StandardMode.vue'
import AddClassMode from './modes/AddClassMode.vue'
import AddStudentMode from './modes/AddStudentMode.vue'
import EditStudentMode from './modes/EditStudentMode.vue'
import RemoveStudentMode from './modes/RemoveStudentMode.vue'
import ReportsMode from './modes/ReportsMode.vue'

const store = useAppStore()

// Available modes
const availableModes: AppMode[] = [
  'STANDARD',
  'ADD CLASS',
  'ADD STUDENT',
  'EDIT STUDENT',
  'REMOVE STUDENT',
  'REPORTS'
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
    case 'ADD CLASS':
      return AddClassMode
    case 'ADD STUDENT':
      return AddStudentMode
    case 'EDIT STUDENT':
      return EditStudentMode
    case 'REMOVE STUDENT':
      return RemoveStudentMode
    case 'REPORTS':
      return ReportsMode
    default:
      return StandardMode
  }
})

// Show mode change modal
const showModeChangeModal = (mode: AppMode) => {
  store.tempMode = mode
  store.showModeModal = true
}

// Show class change modal
const showClassChangeModal = (className: string) => {
  store.tempClass = className
  store.showClassModal = true
}

// Initialize app
onMounted(async () => {
  await store.initDB()
})
</script>

<style scoped>
.scholar-track {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
