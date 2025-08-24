<template>
  <v-dialog v-model="showModal" max-width="400px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-school-plus</v-icon>
        Add New Class
        <v-spacer />
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field
            v-model="className"
            label="Class Name"
            variant="outlined"
            :rules="[
              v => !!v || 'Class name is required',
              v => v.length >= 2 || 'Class name must be at least 2 characters',
              v => !existingClasses.includes(v) || 'Class name already exists'
            ]"
            required
            @keyup.enter="handleSubmit"
          />
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
          Add Class
        </v-btn>
        <v-btn @click="closeModal">Cancel</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/appStore'

const store = useAppStore()

// Local state
const className = ref('')
const isSubmitting = ref(false)

// Computed properties
const showModal = computed(() => store.currentMode === 'ADD CLASS')
const existingClasses = computed(() => store.classes.map(c => c.name))
const isFormValid = computed(() => 
  className.value.length >= 2 && !existingClasses.value.includes(className.value)
)

// Methods
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isSubmitting.value = true
  
  try {
    await store.addClass(className.value)
    closeModal()
  } catch (error) {
    console.error('Failed to add class:', error)
  } finally {
    isSubmitting.value = false
  }
}

const closeModal = () => {
  className.value = ''
  store.currentMode = 'STANDARD'
}
</script>
