<template>
  <v-dialog 
    v-model="showModal" 
    :max-width="modalMaxWidth"
    :fullscreen="xs"
    persistent
  >
    <v-card :class="{ 'fullscreen-modal': xs }">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-account</v-icon>
        <span class="text-truncate">{{ selectedStudent?.label }} {{ selectedStudent?.emoji }}</span>
        <v-spacer />
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text :class="{ 'pa-4': md, 'pa-3': sm, 'pa-2': xs }">
        <v-form @submit.prevent="codeSubmitted ? handleSubmit() : submitCode()">
          <!-- Code Input (only visible when no code has been submitted) -->
          <div v-if="!codeSubmitted">
            <v-text-field
              ref="codeInput"
              v-model="enteredCode"
              :label="codeInputLabel"
              type="password"
              :maxlength="maxCodeLength"
              variant="outlined"
              :rules="codeValidationRules"
              :density="xs ? 'compact' : 'default'"
              required
              @keyup.enter="submitCode"
              @input="onCodeInput"
            />
            
            <v-btn
              color="primary"
              @click="submitCode"
              :disabled="!canSubmitCode"
              :size="xs ? 'large' : 'default'"
              :block="xs"
              class="mt-3"
            >
              Submit Code
            </v-btn>
          </div>

          <!-- Student Status Section (if student code matches) -->
          <div v-if="isStudentCode && !isTeacherCode && codeSubmitted" class="mt-4">
            <h3 class="text-h6 mb-3">Select Status</h3>
            <v-row :dense="xs">
              <v-col 
                v-for="status in studentStatuses" 
                :key="status" 
                :cols="statusGridCols"
                :class="{ 'pa-1': xs }"
              >
                <v-btn
                  :color="selectedStatus === status ? store.statusColors[status] : 'grey'"
                  :variant="selectedStatus === status ? 'flat' : 'outlined'"
                  :size="statusButtonSize"
                  :block="xs"
                  @click="toggleStatus(status)"
                  class="mb-2"
                >
                  {{ status }}
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- Teacher Event Section (if teacher code matches) -->
          <div v-if="isTeacherCode && codeSubmitted" class="mt-4">
            <h3 class="text-h6 mb-3">Record Event</h3>
            <v-row :dense="xs">
              <v-col 
                v-for="event in store.teacherEvents" 
                :key="event" 
                :cols="eventGridCols"
                :class="{ 'pa-1': xs }"
              >
                <v-btn
                  :color="selectedEvent === event ? 'error' : 'grey'"
                  :variant="selectedEvent === event ? 'flat' : 'outlined'"
                  :size="eventButtonSize"
                  :block="xs"
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
            :density="xs ? 'compact' : 'default'"
          >
            {{ errorMessage }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions :class="{ 'pa-4': md, 'pa-3': sm, 'pa-2': xs }">
        <v-spacer />
        <v-btn
          v-if="codeSubmitted"
          color="primary"
          @click="handleSubmit"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          :size="xs ? 'large' : 'default'"
          :block="xs"
        >
          {{ isTeacherCode ? 'Record Event' : 'Apply Status' }}
        </v-btn>
        <v-btn 
          @click="closeModal"
          :size="xs ? 'large' : 'default'"
          :block="xs"
          :class="{ 'mt-2': xs }"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppStore } from '../../stores/appStore'
import type { StudentStatus, TeacherEventType } from '../../types'

const store = useAppStore()
const { xs, sm, md } = useDisplay()

// Local state
const enteredCode = ref('')
const selectedStatus = ref<StudentStatus>('IN CLASS')
const selectedEvent = ref<TeacherEventType | null>(null)
const errorMessage = ref('')
const isSubmitting = ref(false)
const codeInput = ref()
const codeSubmitted = ref(false)

// Computed properties
const showModal = computed(() => store.showStudentModal)
const selectedStudent = computed(() => store.selectedStudent)

// Responsive modal properties
const modalMaxWidth = computed(() => {
  if (xs.value) return '100%'
  if (sm.value) return '400px'
  if (md.value) return '500px'
  return '600px'
})

const statusGridCols = computed(() => {
  if (xs.value) return 6
  if (sm.value) return 4
  return 6
})

const eventGridCols = computed(() => {
  if (xs.value) return 6
  if (sm.value) return 4
  return 6
})

const statusButtonSize = computed(() => {
  if (xs.value) return 'small'
  if (sm.value) return 'default'
  return 'default'
})

const eventButtonSize = computed(() => {
  if (xs.value) return 'small'
  if (sm.value) return 'default'
  return 'default'
})



const maxCodeLength = computed(() => {
  return 6 // Allow up to 6 characters for both student and teacher codes
})

const codeInputLabel = computed(() => {
  return 'Enter code'
})

const codeValidationRules = computed(() => [
  (v: string) => !!v || 'Code is required',
  (v: string) => {
    // Only validate length when user is trying to submit
    if (v.length > 0 && v.length < 4) {
      return 'Code must be at least 4 digits'
    }
    if (v.length > 6) {
      return 'Code must be 6 digits or less'
    }
    return true
  }
])

const canSubmitCode = computed(() => {
  if (!enteredCode.value) return false
  return enteredCode.value.length >= 4 && enteredCode.value.length <= 6
})

const isStudentCode = computed(() => {
  if (!selectedStudent.value || !enteredCode.value || !codeSubmitted.value) return false
  return enteredCode.value === selectedStudent.value.code
})

const isTeacherCode = computed(() => {
  if (!enteredCode.value || !codeSubmitted.value) return false
  return enteredCode.value === store.teacherCode
})

const canSubmit = computed(() => {
  if (!codeSubmitted.value) return false
  
  if (isStudentCode.value) {
    return true // Student can always submit (even to reset to IN CLASS)
  }
  
  if (isTeacherCode.value) {
    return selectedEvent.value !== null
  }
  
  return false
})

const studentStatuses: StudentStatus[] = [
  'IN CLASS',
  'RESTROOM',
  'OFFICE',
  'COUNSELOR',
  'LIBRARY',
  'TEACHER VISIT'
]

// Methods
const onCodeInput = () => {
  // Clear error message when user starts typing
  if (errorMessage.value) {
    errorMessage.value = ''
  }
}

const submitCode = () => {
  if (!enteredCode.value) return
  
  // Check if it's a valid student code (4 digits)
  if (enteredCode.value.length === 4 && enteredCode.value === selectedStudent.value?.code) {
    codeSubmitted.value = true
    errorMessage.value = ''
  }
  // Check if it's a valid teacher code (6 digits)
  else if (enteredCode.value.length === 6 && enteredCode.value === store.teacherCode) {
    codeSubmitted.value = true
    errorMessage.value = ''
  }
  else {
    errorMessage.value = 'Invalid code. Please try again.'
  }
}

const toggleStatus = (status: StudentStatus) => {
  if (selectedStatus.value === status) {
    selectedStatus.value = 'IN CLASS'
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
      store.$patch((_state) => {
        // This would typically use a toast notification system
        console.log(`Status updated for ${selectedStudent.value?.label}: ${selectedStatus.value}`)
      })
    } else if (isTeacherCode.value && selectedEvent.value) {
      // Teacher event recording
      await store.addTransaction({
        studentLabel: selectedStudent.value.label,
        status: 'IN CLASS', // Teacher events don't change status
        eventType: selectedEvent.value
      })
      
      // Show success message
      store.$patch((_state) => {
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
  selectedStatus.value = 'IN CLASS'
  selectedEvent.value = null
  errorMessage.value = ''
  isSubmitting.value = false
  codeSubmitted.value = false
}

// Watch for modal state changes
watch(showModal, async (newValue) => {
  if (newValue) {
    // Focus the code input when modal opens
    await nextTick()
    codeInput.value?.focus()
  } else {
    resetForm()
  }
})
</script>

<style scoped>
.fullscreen-modal {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.fullscreen-modal .v-card-text {
  flex: 1;
  overflow-y: auto;
}

/* Responsive button spacing for mobile */
@media (max-width: 600px) {
  .v-card-actions {
    flex-direction: column;
  }
  
  .v-card-actions .v-btn {
    margin-left: 0 !important;
    margin-top: 8px;
  }
}
</style>
