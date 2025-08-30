<template>
  <v-dialog v-model="showModal" max-width="400px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-text</v-icon>
        Enter Memo
        <v-spacer />
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-2 mb-4">
          Please enter a memo for <strong>{{ statusOrEventName }}</strong> (max 15 characters)
        </p>

        <v-text-field
          ref="memoInput"
          v-model="memoText"
          label="Memo"
          type="text"
          maxlength="15"
          counter="15"
          variant="outlined"
          :rules="[v => !!v || 'Memo is required', v => v.length <= 15 || 'Memo cannot exceed 15 characters']"
          required
          @keyup.enter="submitMemo"
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
          @click="submitMemo"
          :disabled="!memoText || memoText.length > 15"
          :loading="isSubmitting"
          size="large"
          min-width="120"
        >
          Submit Memo
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

interface Props {
  modelValue: boolean
  statusOrEventName: string
  type: 'status' | 'event'
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'submit', memo: string): void
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Local state
const memoText = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const memoInput = ref();

// Computed properties
const showModal = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// Methods
const submitMemo = () => {
  if (!memoText.value || memoText.value.length > 15) {
    errorMessage.value = 'Please enter a valid memo (1-15 characters)';
    return;
  }

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    emit('submit', memoText.value.trim());
    closeModal();
  } catch (error) {
    errorMessage.value = 'Failed to submit memo. Please try again.';
    console.error('Memo submission error:', error);
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  memoText.value = '';
  errorMessage.value = '';
  isSubmitting.value = false;
};

// Watch for modal state changes
watch(showModal, async (newValue) => {
  if (newValue) {
    // Focus the memo input when modal opens
    await nextTick();
    memoInput.value?.focus();
  } else {
    resetForm();
  }
});
</script>
