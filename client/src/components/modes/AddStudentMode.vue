<template>
  <div class="add-student-mode">
    <v-row>
      <v-col cols="12" md="8" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-plus</v-icon>
            Add New Student
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="handleSubmit" ref="form">
              <!-- Student Label -->
              <v-text-field
                v-model="formData.label"
                label="Student Label (2 letters)"
                variant="outlined"
                maxlength="2"
                :rules="[
                  v => !!v || 'Label is required',
                  v => v.length === 2 || 'Label must be exactly 2 letters',
                  v => !existingLabels.includes(v.toUpperCase()) || 'Label already exists'
                ]"
                required
                class="mb-4"
              />

              <!-- Student Code -->
              <v-text-field
                v-model="formData.code"
                label="4-digit Code"
                type="password"
                variant="outlined"
                maxlength="4"
                :rules="[
                  v => !!v || 'Code is required',
                  v => v.length === 4 || 'Code must be exactly 4 digits',
                  v => !existingCodes.includes(v) || 'Code already exists'
                ]"
                required
                class="mb-4"
              />

              <!-- Emoji -->
              <v-text-field
                v-model="formData.emoji"
                label="Emoji"
                variant="outlined"
                maxlength="2"
                :rules="[
                  v => !!v || 'Emoji is required',
                  v => v.length <= 2 || 'Emoji must be 1-2 characters'
                ]"
                required
                class="mb-4"
              />

              <!-- Class Selection -->
              <v-select
                v-model="formData.classes"
                :items="availableClasses"
                label="Classes"
                variant="outlined"
                multiple
                chips
                :rules="[
                  v => v.length > 0 || 'At least one class must be selected'
                ]"
                required
                class="mb-4"
              />

              <!-- Preview -->
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="text-h6">Preview</v-card-title>
                <v-card-text>
                  <div class="d-flex align-center">
                    <div
                      class="student-square-preview"
                      :style="{ backgroundColor: store.statusColors.DEFAULT }"
                    >
                      <div class="student-content">
                        <div class="student-label">{{ formData.label.toUpperCase() || 'XX' }}</div>
                        <div class="student-emoji">{{ formData.emoji || '😊' }}</div>
                        <div class="student-status">DEFAULT</div>
                      </div>
                    </div>
                    <div class="ml-4">
                      <p><strong>Label:</strong> {{ formData.label.toUpperCase() || 'XX' }}</p>
                      <p><strong>Code:</strong> {{ formData.code || '****' }}</p>
                      <p><strong>Classes:</strong> {{ formData.classes.join(', ') || 'None selected' }}</p>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              @click="handleSubmit"
              :disabled="!isFormValid"
              :loading="isSubmitting"
            >
              Add Student
            </v-btn>
            <v-btn @click="resetForm">Reset</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <v-col cols="12" md="4" lg="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-information</v-icon>
            Instructions
          </v-card-title>
          
          <v-card-text>
            <ul class="text-body-2">
              <li>Student label must be exactly 2 letters (e.g., "JD", "SM")</li>
              <li>Code must be exactly 4 digits (e.g., "1234")</li>
              <li>Emoji should be 1-2 characters (e.g., "😊", "🏃")</li>
              <li>Student can be assigned to multiple classes</li>
              <li>Label + emoji combination must be unique within each class</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/appStore'
import type { NewStudent } from '../../types'

const store = useAppStore()

// Form data
const formData = ref<NewStudent>({
  label: '',
  code: '',
  emoji: '',
  classes: []
})

const isSubmitting = ref(false)

// Computed properties
const availableClasses = computed(() => 
  store.classes.map(c => ({ title: c.name, value: c.name }))
)

const existingLabels = computed(() => 
  store.students.map(s => s.label.toUpperCase())
)

const existingCodes = computed(() => 
  store.students.map(s => s.code)
)

const isFormValid = computed(() => {
  return (
    formData.value.label.length === 2 &&
    formData.value.code.length === 4 &&
    formData.value.emoji.length > 0 &&
    formData.value.classes.length > 0 &&
    !existingLabels.value.includes(formData.value.label.toUpperCase()) &&
    !existingCodes.value.includes(formData.value.code)
  )
})

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    await store.addStudent({
      ...formData.value,
      label: formData.value.label.toUpperCase()
    })
    
    // Show success message
    store.$patch((state) => {
      console.log(`Student ${formData.value.label} added successfully`)
    })
    
    resetForm()
  } catch (error) {
    console.error('Failed to add student:', error)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  formData.value = {
    label: '',
    code: '',
    emoji: '',
    classes: []
  }
}
</script>

<style scoped>
.student-square-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-content {
  text-align: center;
  color: white;
  font-weight: 500;
}

.student-label {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 2px;
}

.student-emoji {
  font-size: 1.2rem;
  margin-bottom: 2px;
}

.student-status {
  font-size: 0.6rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
