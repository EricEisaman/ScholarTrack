<template>
  <v-dialog v-model="showModal" max-width="400px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-cog</v-icon>
        Change Mode
        <v-spacer />
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 mb-4">
          Enter teacher code to switch to <strong>{{ tempMode }}</strong> mode
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
          :disabled="!enteredCode || enteredCode.length !== 6"
        >
          Change Mode
        </v-btn>
        <v-btn @click="closeModal">Cancel</v-btn>
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
const showModal = computed(() => store.showModeModal);
const tempMode = computed(() => store.tempMode);

// Methods
const handleSubmit = async () => {
  if (enteredCode.value === store.teacherCode) {
    store.tempCode = enteredCode.value;
    await store.changeMode(tempMode.value);
    resetForm();
  } else {
    errorMessage.value = 'Invalid teacher code';
  }
};

const closeModal = () => {
  store.showModeModal = false;
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
    codeInput.value?.focus();
  } else {
    resetForm();
  }
});
</script>
