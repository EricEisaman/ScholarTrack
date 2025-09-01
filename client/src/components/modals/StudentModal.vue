<template>
  <v-dialog
    v-model="showModal"
    :max-width="modalMaxWidth"
    :fullscreen="xs"
    persistent
  >
    <v-card :class="{ 'fullscreen-modal': xs }">
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">
          mdi-account
        </v-icon>
        <span class="text-truncate">{{ selectedStudent?.label }} {{ selectedStudent?.emoji }}</span>
        <v-spacer />
        <v-btn
          icon
          @click="closeModal"
        >
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
              :disabled="!canSubmitCode"
              :size="xs ? 'large' : 'default'"
              :block="xs"
              class="mt-3"
              @click="submitCode"
            >
              Submit Code
            </v-btn>
          </div>

          <!-- Teacher Mode Toggle (if teacher code matches) -->
          <div
            v-if="isTeacherCode && codeSubmitted"
            class="mt-4"
          >
            <div class="d-flex align-center mb-3">
              <h3 class="text-h6 mb-0">
                Teacher Actions
              </h3>
              <v-spacer />
              <v-btn-toggle
                v-model="teacherMode"
                color="primary"
                mandatory
                density="compact"
              >
                <v-btn
                  value="event"
                  size="small"
                >
                  <v-icon start>
                    mdi-calendar-plus
                  </v-icon>
                  Record Event
                </v-btn>
                <v-btn
                  value="status"
                  size="small"
                >
                  <v-icon start>
                    mdi-account-edit
                  </v-icon>
                  Change Status
                </v-btn>
              </v-btn-toggle>
            </div>
          </div>

          <!-- Student Status Section (if student code matches OR teacher in status mode) -->
          <div
            v-if="(isStudentCode && !isTeacherCode && codeSubmitted) || (isTeacherCode && teacherMode === 'status' && codeSubmitted)"
            class="mt-4"
          >
            <h3 class="text-h6 mb-3">
              Select Status
            </h3>
            <div class="d-flex flex-wrap">
              <v-btn
                v-for="status in studentStatuses"
                :key="status"
                :color="selectedStatus === status ? store.statusColors[status] : 'grey'"
                :variant="selectedStatus === status ? 'flat' : 'outlined'"
                :size="statusButtonSize"
                :width="statusButtonWidth"
                :height="xs ? '48px' : sm ? '48px' : '40px'"
                class="mb-3 mr-3 text-wrap"
                @click="handleStatusSelection(status)"
              >
                {{ status }}
              </v-btn>
            </div>
          </div>

          <!-- Teacher Event Section (if teacher code matches and in event mode) -->
          <div
            v-if="isTeacherCode && teacherMode === 'event' && codeSubmitted"
            class="mt-4"
          >
            <h3 class="text-h6 mb-3">
              Record Event
            </h3>
            <div class="d-flex flex-wrap">
              <v-btn
                v-for="event in store.teacherEvents"
                :key="event"
                :color="selectedEvent === event ? 'error' : 'grey'"
                :variant="selectedEvent === event ? 'flat' : 'outlined'"
                :size="eventButtonSize"
                :width="eventButtonWidth"
                :height="xs ? '48px' : sm ? '48px' : '40px'"
                class="mb-3 mr-3 text-wrap"
                @click="handleEventSelection(event)"
              >
                {{ event }}
              </v-btn>
            </div>
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
          color="quaternary"
          :disabled="!canSubmit"
          :loading="isSubmitting"
          :size="xs ? 'large' : 'default'"
          :block="xs"
          @click="handleSubmit"
        >
          {{ getSubmitButtonText() }}
        </v-btn>
        <v-btn
          :size="xs ? 'large' : 'default'"
          :block="xs"
          :class="{ 'mt-2': xs }"
          @click="closeModal"
        >
          Cancel
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Memo Modal -->
  <MemoModal
    v-model="showMemoModal"
    :status-or-event-name="memoStatusOrEventName"
    :type="memoType"
    @submit="handleMemoSubmit"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useDisplay } from 'vuetify';
import { useAppStore } from '../../stores/appStore';
import type { StudentStatus, TeacherEventType } from '../../types';
import MemoModal from './MemoModal.vue';
import { componentLogger } from '../../services/logger';

const store = useAppStore();
const { xs, sm, md } = useDisplay();

// Local state
const enteredCode = ref('');
const selectedStatus = ref<StudentStatus>('IN CLASS');
const selectedEvent = ref<TeacherEventType | null>(null);
const errorMessage = ref('');
const isSubmitting = ref(false);
const codeInput = ref<{ focus: () => void } | null>(null);
const codeSubmitted = ref(false);
const teacherMode = ref<'status' | 'event'>('event'); // Teacher mode toggle

// Memo modal state
const showMemoModal = ref(false);
const memoStatusOrEventName = ref('');
const memoType = ref<'status' | 'event'>('status');

// Computed properties
const showModal = computed(() => store.showStudentModal);
const selectedStudent = computed(() => store.selectedStudent);

// Responsive modal properties
const modalMaxWidth = computed(() => {
  if (xs.value) return '100%';
  if (sm.value) return '400px';
  if (md.value) return '500px';
  return '600px';
});

const statusButtonSize = computed(() => {
  if (xs.value) return 'large'; // Larger buttons on mobile
  if (sm.value) return 'large'; // Larger buttons on small screens for better text fit
  return 'default';
});

const eventButtonSize = computed(() => {
  if (xs.value) return 'large'; // Larger buttons on mobile
  if (sm.value) return 'large'; // Larger buttons on small screens for better text fit
  return 'default';
});

// Computed button widths based on longest labels
const statusButtonWidth = computed(() => {
  // Find the longest status label
  const longestStatus = studentStatuses.value.reduce((longest, current) =>
    current.length > longest.length ? current : longest, '',
  );

  // Calculate width based on character count and screen size
  const baseWidth = longestStatus.length * 8; // Approximate pixels per character
  const minWidth = xs.value ? 140 : sm.value ? 160 : 180;
  const maxWidth = xs.value ? 200 : sm.value ? 240 : 280;

  return `${Math.max(minWidth, Math.min(maxWidth, baseWidth + 40))}px`; // Add padding
});

const eventButtonWidth = computed(() => {
  // Find the longest event label
  const longestEvent = store.teacherEvents.reduce((longest, current) =>
    current.length > longest.length ? current : longest, '',
  );

  // Calculate width based on character count and screen size
  const baseWidth = longestEvent.length * 8; // Approximate pixels per character
  const minWidth = xs.value ? 160 : sm.value ? 180 : 200;
  const maxWidth = xs.value ? 240 : sm.value ? 280 : 320;

  return `${Math.max(minWidth, Math.min(maxWidth, baseWidth + 40))}px`; // Add padding
});

const maxCodeLength = computed(() => {
  return 6; // Allow up to 6 characters for both student and teacher codes
});

const codeInputLabel = computed((): string => {
  return 'Enter code';
});

const codeValidationRules = computed((): ((v: string) => boolean | string)[] => [
  (v: string): boolean | string => !!v || 'Code is required',
  (v: string): boolean | string => {
    // Only validate length when user is trying to submit
    if (v.length > 0 && v.length < 4) {
      return 'Code must be at least 4 digits';
    }
    if (v.length > 6) {
      return 'Code must be 6 digits or less';
    }
    return true;
  },
]);

const canSubmitCode = computed((): boolean => {
  if (!enteredCode.value) return false;
  return enteredCode.value.length >= 4 && enteredCode.value.length <= 6;
});

const isStudentCode = computed((): boolean => {
  if (!selectedStudent.value || !enteredCode.value || !codeSubmitted.value) return false;
  return enteredCode.value === selectedStudent.value.code;
});

const isTeacherCode = computed((): boolean => {
  if (!enteredCode.value || !codeSubmitted.value) return false;
  return enteredCode.value === store.teacherCode;
});

const canSubmit = computed((): boolean => {
  if (!codeSubmitted.value) return false;

  if (isStudentCode.value) {
    return true; // Student can always submit (even to reset to IN CLASS)
  }

  if (isTeacherCode.value) {
    if (teacherMode.value === 'event') {
      return selectedEvent.value !== null;
    } else {
      return true; // Teacher can always change status
    }
  }

  return false;
});

// Computed property that includes both default and custom status types
const studentStatuses = computed((): StudentStatus[] => {
  const defaultStatuses: StudentStatus[] = [
    'IN CLASS',
    'RESTROOM',
    'OFFICE',
    'COUNSELOR',
    'LIBRARY',
    'TEACHER VISIT',
  ];

  // Add custom status types from the store
  const customStatuses = store.customStatusTypes.map(status => status.name);

  return [...defaultStatuses, ...customStatuses];
});

// Methods
const onCodeInput = (): void => {
  // Clear error message when user starts typing
  if (errorMessage.value) {
    errorMessage.value = '';
  }
};

const submitCode = (): void => {
  if (!enteredCode.value) return;

  // Check if it's a valid student code (4 digits)
  if (enteredCode.value.length === 4 && enteredCode.value === selectedStudent.value?.code) {
    codeSubmitted.value = true;
    errorMessage.value = '';
  }
  // Check if it's a valid teacher code (6 digits)
  else if (enteredCode.value.length === 6 && enteredCode.value === store.teacherCode) {
    codeSubmitted.value = true;
    errorMessage.value = '';
  }
  else {
    errorMessage.value = 'Invalid code. Please try again.';
  }
};

const handleStatusSelection = (status: StudentStatus): void => {
  selectedStatus.value = status;

  // Check if this status requires a memo
  if (store.requiresMemo(status, 'status')) {
    memoStatusOrEventName.value = status;
    memoType.value = 'status';
    showMemoModal.value = true;
  }
};

const handleEventSelection = (event: TeacherEventType): void => {
  selectedEvent.value = event;

  // Check if this status requires a memo
  if (store.requiresMemo(event, 'event')) {
    memoStatusOrEventName.value = event;
    memoType.value = 'event';
    showMemoModal.value = true;
  }
};

const handleMemoSubmit = async (memo: string): Promise<void> => {
  if (!selectedStudent.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    if (isStudentCode.value) {
      // Student status change with memo
      await store.addTransaction({
        studentLabel: selectedStudent.value.label,
        studentCode: selectedStudent.value.code,
        status: selectedStatus.value,
        memo,
      });

      // Show success message
      store.$patch((_state) => {
        componentLogger.info('StudentModal', `Status updated for ${selectedStudent.value?.label} (${selectedStudent.value?.emoji}): ${selectedStatus.value} with memo: ${memo}`);
      });
    } else if (isTeacherCode.value && selectedEvent.value) {
      // Teacher event recording with memo
      await store.addTransaction({
        studentLabel: selectedStudent.value.label,
        studentCode: selectedStudent.value.code,
        status: 'IN CLASS', // Teacher events don't change status
        eventType: selectedEvent.value,
        memo,
      });

      // Show success message
      store.$patch((_state) => {
        componentLogger.info('StudentModal', `Event recorded for ${selectedStudent.value?.label} (${selectedStudent.value?.emoji}): ${selectedEvent.value} with memo: ${memo}`);
      });
    }

    closeModal();
  } catch (error) {
    errorMessage.value = 'Failed to save transaction. Please try again.';
    componentLogger.error('StudentModal', 'Transaction error', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isSubmitting.value = false;
  }
};

const getSubmitButtonText = (): string => {
  if (isStudentCode.value) {
    return 'Apply Status';
  }
  if (isTeacherCode.value) {
    return teacherMode.value === 'event' ? 'Record Event' : 'Apply Status';
  }
  return 'Submit';
};

const handleSubmit = async (): Promise<void> => {
  if (!selectedStudent.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    if (isStudentCode.value) {
      // Student status change
      await store.addTransaction({
        studentLabel: selectedStudent.value.label,
        studentCode: selectedStudent.value.code,
        status: selectedStatus.value,
      });

      // Show success message
      store.$patch((_state) => {
        // This would typically use a toast notification system
        componentLogger.info('StudentModal', `Status updated for ${selectedStudent.value?.label} (${selectedStudent.value?.emoji}): ${selectedStatus.value}`);
      });
    } else if (isTeacherCode.value) {
      if (teacherMode.value === 'event' && selectedEvent.value) {
        // Teacher event recording
        await store.addTransaction({
          studentLabel: selectedStudent.value.label,
          studentCode: selectedStudent.value.code,
          status: 'IN CLASS', // Teacher events don't change status
          eventType: selectedEvent.value,
        });

        // Show success message
        store.$patch((_state) => {
          componentLogger.info('StudentModal', `Event recorded for ${selectedStudent.value?.label} (${selectedStudent.value?.emoji}): ${selectedEvent.value}`);
        });
      } else if (teacherMode.value === 'status') {
        // Teacher status change
        await store.addTransaction({
          studentLabel: selectedStudent.value.label,
          studentCode: selectedStudent.value.code,
          status: selectedStatus.value,
        });

        // Show success message
        store.$patch((_state) => {
          componentLogger.info('StudentModal', `Status changed by teacher for ${selectedStudent.value?.label} (${selectedStudent.value?.emoji}): ${selectedStatus.value}`);
        });
      }
    }

    closeModal();
  } catch (error) {
    errorMessage.value = 'Failed to save transaction. Please try again.';
    componentLogger.error('StudentModal', 'Transaction error', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = (): void => {
  store.closeStudentModal();
  resetForm();
};

const resetForm = (): void => {
  enteredCode.value = '';
  selectedStatus.value = 'IN CLASS';
  selectedEvent.value = null;
  errorMessage.value = '';
  isSubmitting.value = false;
  codeSubmitted.value = false;
  teacherMode.value = 'event'; // Reset to default teacher mode
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
