<template>
  <v-dialog v-model="showModal" max-width="400px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-school</v-icon>
        Change Class
        <v-spacer />
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 mb-4">
          Enter teacher code to switch to <strong>{{ tempClass }}</strong>
        </p>

        <v-text-field
          ref="codeInput"
          v-model="enteredCode"
          label="Teacher Code"
          type="password"
          maxlength="6"
          variant="outlined"
          :rules="[v => !!v || 'Code is required', v => v.length === 6 || 'Code must be 6 digits']"
          required
          @keyup.enter="handleSubmit"
        />

        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          class="mt-4"
        >
          {{ errorMessage }}
        </v-alert>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          @click="handleSubmit"
          :disabled="!enteredCode || enteredCode.length !== 4"
          size="large"
          min-width="140"
        >
          Change Class
        </v-btn>
        <v-btn
          @click="closeModal"
          size="large"
          min-width="100"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

// Local state
const enteredCode = ref('');
const errorMessage = ref('');
const codeInput = ref();

// Computed properties
const showModal = computed(() => store.showClassModal);
const tempClass = computed(() => store.tempClass);

// Methods
const handleSubmit = () => {
  if (enteredCode.value === store.teacherCode) {
    store.tempCode = enteredCode.value;
    store.changeClass(tempClass.value);
    resetForm();
  } else {
    errorMessage.value = 'Invalid teacher code';
  }
};

const closeModal = () => {
  store.showClassModal = false;
  resetForm();
};

const resetForm = () => {
  enteredCode.value = '';
  errorMessage.value = '';
};

// Watch for modal state changes
watch(showModal, async (newValue) => {
  if (newValue) {
    // Focus the code input when modal opens
    await nextTick();
    if (codeInput.value && typeof codeInput.value.focus === 'function') {
      codeInput.value.focus();
    }
  } else {
    resetForm();
  }
});
</script>
