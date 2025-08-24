<template>
  <v-dialog v-model="showModal" max-width="500px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-account</v-icon>
        {{ selectedStudent?.label }} {{ selectedStudent?.emoji }}
        <v-spacer />
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <!-- Code Input -->
          <v-text-field
            v-model="enteredCode"
            label="Enter 4-digit code"
            type="password"
            maxlength="4"
            variant="outlined"
            :rules="[v => !!v || 'Code is required', v => v.length === 4 || 'Code must be 4 digits']"
            required
          />

          <!-- Student Status Section (if student code matches) -->
          <div v-if="isStudentCode && !isTeacherCode" class="mt-4">
            <h3 class="text-h6 mb-3">Select Status</h3>
            <v-row>
              <v-col v-for="status in studentStatuses" :key="status" cols="6">
                <v-btn
                  :color="selectedStatus === status ? store.statusColors[status] : 'grey'"
                  :variant="selectedStatus === status ? 'flat' : 'outlined'"
                  block
                  @click="toggleStatus(status)"
                  class="mb-2"
                >
                  {{ status }}
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- Teacher Event Section (if teacher code matches) -->
          <div v-if="isTeacherCode" class="mt-4">
            <h3 class="text-h6 mb-3">Record Event</h3>
            <v-row>
              <v-col v-for="event in store.teacherEvents" :key="event" cols="6">
                <v-btn
                  :color="selectedEvent === event ? 'error' : 'grey'"
                  :variant="selectedEvent === event ? 'flat' : 'outlined'"
                  block
                  @click="selectedEvent = event"
                  class="mb-2"
                >
                  {{ event }}
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- Error Message -->
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            class="mt-4"
          >
            {{ errorMessage }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          @click="handleSubmit"
          :disabled="!canSubmit"
          :loading="isSubmitting"
        >
          {{ isTeacherCode ? 'Record Event' : 'Apply Status' }}
        </v-btn>
        <v-btn @click="closeModal">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppStore } from '../../stores/appStore'
import type { StudentStatus, TeacherEventType } from '../../types'

const store = useAppStore()

// Local state
const enteredCode = ref('')
const selectedStatus = ref<StudentStatus>('DEFAULT')
const selectedEvent = ref<TeacherEventType | null>(null)
const errorMessage = ref('')
const isSubmitting = ref(false)

// Computed properties
const showModal = computed(() => store.showStudentModal)
const selectedStudent = computed(() => store.selectedStudent)

const isStudentCode = computed(() => {
  if (!selectedStudent.value || !enteredCode.value) return false
  return enteredCode.value === selectedStudent.value.code
})

const isTeacherCode = computed(() => {
  return enteredCode.value === store.teacherCode
})

const canSubmit = computed(() => {
  if (!enteredCode.value || enteredCode.value.length !== 4) return false
  
  if (isStudentCode.value) {
    return true // Student can always submit (even to reset to DEFAULT)
  }
  
  if (isTeacherCode.value) {
    return selectedEvent.value !== null
  }
  
  return false
})

const studentStatuses: StudentStatus[] = [
  'DEFAULT',
  'RESTROOM',
  'OFFICE',
  'COUNSELOR',
  'LIBRARY',
  'TEACHER VISIT'
]

// Methods
const toggleStatus = (status: StudentStatus) => {
  if (selectedStatus.value === status) {
    selectedStatus.value = 'DEFAULT'
  } else {
    selectedStatus.value = status
  }
}

const handleSubmit = async () => {
  if (!selectedStudent.value) return
  
  isSubmitting.value = true
  errorMessage.value = ''
  
  try {
    if (isStudentCode.value) {
      // Student status change
      await store.addTransaction({
        studentLabel: selectedStudent.value.label,
        status: selectedStatus.value
      })
      
      // Show success message
      store.$patch((state) => {
        // This would typically use a toast notification system
        console.log(`Status updated for ${selectedStudent.value?.label}: ${selectedStatus.value}`)
      })
    } else if (isTeacherCode.value && selectedEvent.value) {
      // Teacher event recording
      await store.addTransaction({
        studentLabel: selectedStudent.value.label,
        status: 'DEFAULT', // Teacher events don't change status
        eventType: selectedEvent.value
      })
      
      // Show success message
      store.$patch((state) => {
        console.log(`Event recorded for ${selectedStudent.value?.label}: ${selectedEvent.value}`)
      })
    }
    
    closeModal()
  } catch (error) {
    errorMessage.value = 'Failed to save transaction. Please try again.'
    console.error('Transaction error:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  store.closeStudentModal()
  resetForm()
}

const resetForm = () => {
  enteredCode.value = ''
  selectedStatus.value = 'DEFAULT'
  selectedEvent.value = null
  errorMessage.value = ''
  isSubmitting.value = false
}

// Watch for modal state changes
watch(showModal, (newValue) => {
  if (!newValue) {
    resetForm()
  }
})
</script>
