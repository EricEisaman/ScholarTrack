<template>
  <div>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <!-- Custom Status Types Section -->
        <v-card class="mb-4">
          <v-card-title class="text-h5 d-flex align-center">
            <v-icon class="mr-2">
              mdi-flag
            </v-icon>
            Custom Status Types
          </v-card-title>

          <v-card-text>
            <v-form
              ref="statusForm"
              v-model="statusFormValid"
            >
              <v-text-field
                v-model="newStatusName"
                label="Status Name"
                :rules="getStatusNameRules()"
                required
                clearable
                :error-messages="statusValidation?.errors.join(', ') || null"
                :hint="statusValidation?.warnings.join(', ') || undefined"
                persistent-hint
                @input="validateStatusName"
                @keyup.enter="addStatusType"
              />

              <v-color-picker
                v-model="newStatusColor"
                mode="hex"
                class="mb-4"
              />

              <v-checkbox
                v-model="newStatusIncludeMemo"
                label="Include Memo"
                hint="If checked, students will be prompted to enter a memo when selecting this status"
                persistent-hint
                class="mb-4"
              />

              <v-btn
                color="primary"
                variant="elevated"
                :disabled="!statusFormValid"
                :loading="isAddingStatus"
                class="mt-4"
                @click="addStatusType"
              >
                Add Status Type
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <!-- Custom Teacher Event Types Section -->
        <v-card class="mb-4">
          <v-card-title class="text-h5 d-flex align-center">
            <v-icon class="mr-2">
              mdi-calendar-alert
            </v-icon>
            Custom Teacher Event Types
          </v-card-title>

          <v-card-text>
            <v-form
              ref="eventForm"
              v-model="eventFormValid"
            >
              <v-text-field
                v-model="newEventName"
                label="Event Name"
                :rules="getEventNameRules()"
                required
                clearable
                :error-messages="eventValidation?.errors.join(', ') || null"
                :hint="eventValidation?.warnings.join(', ') || undefined"
                persistent-hint
                @input="validateEventName"
                @keyup.enter="addEventType"
              />

              <v-checkbox
                v-model="newEventIncludeMemo"
                label="Include Memo"
                hint="If checked, teachers will be prompted to enter a memo when recording this event"
                persistent-hint
                class="mb-4"
              />

              <v-btn
                color="secondary"
                variant="elevated"
                :disabled="!eventFormValid"
                :loading="isAddingEvent"
                class="mt-4"
                @click="addEventType"
              >
                Add Event Type
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Custom Status Types List -->
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-card>
          <v-card-title class="text-h6">
            Current Custom Status Types
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="customStatusTypes.length === 0"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              No custom status types available. Add your first custom status type above.
            </v-alert>

            <v-list v-else>
              <v-list-item
                v-for="status in customStatusTypes"
                :key="status.id"
                class="mb-2 custom-status-item"
              >
                <template #prepend>
                  <v-icon
                    :icon="'mdi-flag'"
                    :color="status.color"
                    size="large"
                  />
                </template>

                <v-list-item-title>{{ status.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Created: {{ new Date(status.createdAt).toLocaleDateString() }}
                </v-list-item-subtitle>

                <template #append>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click="editStatusType(status)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="removeStatusType(status.id)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Custom Teacher Event Types List -->
      <v-col
        cols="12"
        md="6"
      >
        <v-card>
          <v-card-title class="text-h6">
            Current Custom Teacher Event Types
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="customTeacherEventTypes.length === 0"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              No custom teacher event types available. Add your first custom event type above.
            </v-alert>

            <v-list v-else>
              <v-list-item
                v-for="event in customTeacherEventTypes"
                :key="event.id"
                class="mb-2 custom-event-item"
              >
                <template #prepend>
                  <v-icon
                    icon="mdi-calendar-alert"
                    color="secondary"
                    size="large"
                  />
                </template>

                <v-list-item-title>{{ event.name }}</v-list-item-title>
                <v-list-item-subtitle>
                  Created: {{ new Date(event.createdAt).toLocaleDateString() }}
                </v-list-item-subtitle>

                <template #append>
                  <v-btn
                    icon="mdi-pencil"
                    variant="text"
                    size="small"
                    @click="editEventType(event)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click="removeEventType(event.id)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Management Section -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h6 d-flex align-center">
            <v-icon class="mr-2">
              mdi-database
            </v-icon>
            Data Management
          </v-card-title>

          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  variant="outlined"
                  class="pa-4"
                >
                  <h4 class="text-h6 mb-3">
                    Data Validation
                  </h4>

                  <v-btn
                    color="primary"
                    variant="outlined"
                    :loading="isValidating"
                    class="mb-3"
                    @click="validateData"
                  >
                    Check Data Integrity
                  </v-btn>

                  <div v-if="validationResults">
                    <v-alert
                      v-if="validationResults.orphanedStatuses.length === 0 && validationResults.orphanedEvents.length === 0"
                      type="success"
                      variant="tonal"
                      class="mb-3"
                    >
                      ✅ All data is valid and consistent
                    </v-alert>

                    <v-alert
                      v-else
                      type="warning"
                      variant="tonal"
                      class="mb-3"
                    >
                      ⚠️ Found orphaned data that needs attention
                    </v-alert>

                    <div
                      v-if="validationResults.orphanedStatuses.length > 0"
                      class="mb-3"
                    >
                      <strong>Orphaned Status Types:</strong>
                      <v-chip
                        v-for="status in validationResults.orphanedStatuses"
                        :key="status"
                        color="warning"
                        size="small"
                        class="ma-1"
                      >
                        {{ status }}
                      </v-chip>
                    </div>

                    <div v-if="validationResults.orphanedEvents.length > 0">
                      <strong>Orphaned Event Types:</strong>
                      <v-chip
                        v-for="event in validationResults.orphanedEvents"
                        :key="event"
                        color="warning"
                        size="small"
                        class="ma-1"
                      >
                        {{ event }}
                      </v-chip>
                    </div>
                  </div>
                </v-card>
              </v-col>

              <v-col
                cols="12"
                md="6"
              >
                <v-card
                  variant="outlined"
                  class="pa-4"
                >
                  <h4 class="text-h6 mb-3">
                    Backup & Restore
                  </h4>

                  <v-btn
                    color="secondary"
                    variant="outlined"
                    :loading="isExporting"
                    class="mb-3 mr-2"
                    @click="exportBackup"
                  >
                    Export Backup
                  </v-btn>

                  <v-btn
                    color="warning"
                    variant="outlined"
                    class="mb-3"
                    @click="showImportDialog = true"
                  >
                    Import Backup
                  </v-btn>

                  <v-file-input
                    v-model="backupFile"
                    accept=".json"
                    label="Backup File"
                    prepend-icon="mdi-file-upload"
                    class="mb-3"
                    @change="handleBackupFileChange"
                  />

                  <v-btn
                    color="error"
                    variant="outlined"
                    class="mb-3"
                    @click="showClearDataDialog = true"
                  >
                    Clear All Data
                  </v-btn>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Import Backup Dialog -->
    <v-dialog
      v-model="showImportDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Import Backup</v-card-title>
        <v-card-text>
          <p class="mb-4">
            Importing a backup will replace all current data. This action cannot be undone.
          </p>
          <v-file-input
            v-model="importFile"
            accept=".json"
            label="Select Backup File"
            required
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showImportDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="isImporting"
            :disabled="!importFile"
            size="large"
            min-width="120"
            @click="importBackup"
          >
            Import
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Clear Data Dialog -->
    <v-dialog
      v-model="showClearDataDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h6">
          <v-icon
            color="error"
            class="mr-2"
          >
            mdi-delete-alert
          </v-icon>
          Clear All Data
        </v-card-title>
        <v-card-text>
          <p class="mb-4">
            This will permanently delete all students, classes, transactions, and custom types.
            This action cannot be undone.
          </p>
          <p class="text-caption text-medium-emphasis">
            Consider exporting a backup first if you want to preserve any data.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showClearDataDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            :loading="isClearingData"
            size="large"
            min-width="160"
            @click="clearAllData"
          >
            Clear All Data
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Migration Error Dialog -->
    <v-dialog
      v-model="showMigrationErrorDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h6">
          <v-icon
            color="error"
            class="mr-2"
          >
            mdi-alert-circle
          </v-icon>
          Migration Failed
        </v-card-title>
        <v-card-text>
          <v-alert
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ migrationError }}
          </v-alert>

          <div
            v-if="migrationResultData?.rollbackPerformed"
            class="mb-4"
          >
            <v-alert
              type="warning"
              variant="tonal"
            >
              <strong>Automatic Rollback Performed</strong><br>
              The system detected an error during migration and automatically rolled back to the previous state.
              Your data has been preserved.
            </v-alert>
          </div>

          <div
            v-if="migrationResultData?.snapshotId"
            class="mt-4"
          >
            <p class="text-caption">
              A snapshot was created before the migration (ID: {{ migrationResultData.snapshotId }}).
              You can manually restore from this snapshot if needed.
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showMigrationErrorDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Migration Success Dialog -->
    <v-dialog
      v-model="showMigrationSuccessDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title class="text-h6">
          <v-icon
            color="success"
            class="mr-2"
          >
            mdi-check-circle
          </v-icon>
          Migration Successful
        </v-card-title>
        <v-card-text>
          <v-alert
            type="success"
            variant="tonal"
            class="mb-4"
          >
            The migration completed successfully!
          </v-alert>

          <div class="text-body-2">
            <p><strong>Affected Records:</strong> {{ migrationSuccessData?.affectedRecords || 0 }}</p>
            <p v-if="migrationSuccessData?.snapshotId">
              <strong>Snapshot ID:</strong> {{ migrationSuccessData.snapshotId }}
            </p>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showMigrationSuccessDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Status Type Dialog -->
    <v-dialog
      v-model="showEditStatusDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Edit Status Type</v-card-title>
        <v-card-text>
          <v-form
            ref="editStatusForm"
            v-model="editStatusFormValid"
          >
            <v-text-field
              v-model="editingStatus.name"
              label="Status Name"
              :rules="getEditStatusNameRules()"
              required
              :error-messages="editStatusValidation?.errors.join(', ') || null"
              :hint="editStatusValidation?.warnings.join(', ') || undefined"
              persistent-hint
              @input="validateEditStatusName"
            />

            <v-color-picker
              v-model="editingStatus.color"
              mode="hex"
              class="mb-4"
            />

            <v-checkbox
              v-model="editingStatus.includeMemo"
              label="Include Memo"
              hint="If checked, students will be prompted to enter a memo when selecting this status"
              persistent-hint
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showEditStatusDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!editStatusFormValid"
            size="large"
            min-width="120"
            @click="updateStatusType"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Event Type Dialog -->
    <v-dialog
      v-model="showEditEventDialog"
      max-width="500px"
    >
      <v-card>
        <v-card-title>Edit Event Type</v-card-title>
        <v-card-text>
          <v-form
            ref="editEventForm"
            v-model="editEventFormValid"
          >
            <v-text-field
              v-model="editingEvent.name"
              label="Event Name"
              :rules="[v => !!v || 'Event name is required']"
              required
            />

            <v-checkbox
              v-model="editingEvent.includeMemo"
              label="Include Memo"
              hint="If checked, teachers will be prompted to enter a memo when recording this event"
              persistent-hint
              class="mb-4"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showEditEventDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :disabled="!editEventFormValid"
            size="large"
            min-width="120"
            @click="updateEventType"
          >
            Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="400px"
    >
      <v-card>
        <v-card-title>Confirm Deletion</v-card-title>
        <v-card-text>
          Are you sure you want to delete "{{ itemToDelete?.name }}"? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showConfirmDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            size="large"
            min-width="120"
            @click="confirmDelete"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Data Management Dialog -->
    <v-dialog
      v-model="showDataManagementDialog"
      max-width="600px"
    >
      <v-card>
        <v-card-title class="text-h6">
          <v-icon
            color="warning"
            class="mr-2"
          >
            mdi-alert
          </v-icon>
          Data Management Required
        </v-card-title>

        <v-card-text>
          <p class="mb-4">
            The custom {{ itemToDelete?.type === 'status' ? 'status type' : 'event type' }}
            <strong>"{{ itemToDelete?.name }}"</strong> is currently being used in
            {{ itemToDelete?.type === 'status' ? 'student transactions' : 'teacher events' }}.
            You must choose how to handle this data before deletion.
          </p>

          <v-radio-group
            v-model="orphanedDataAction"
            class="mb-4"
          >
            <v-radio
              value="migrate"
              label="Migrate to another type"
            >
              <template #label>
                <div>
                  <strong>Migrate to another type</strong>
                  <div class="text-caption text-medium-emphasis">
                    Move all existing data to a different type
                  </div>
                </div>
              </template>
            </v-radio>

            <v-radio
              value="delete"
              label="Delete affected data"
            >
              <template #label>
                <div>
                  <strong>Delete affected data</strong>
                  <div class="text-caption text-medium-emphasis">
                    Remove all transactions using this type (data will be lost)
                  </div>
                </div>
              </template>
            </v-radio>

            <v-radio
              value="keep"
              label="Keep the type"
            >
              <template #label>
                <div>
                  <strong>Keep the type</strong>
                  <div class="text-caption text-medium-emphasis">
                    Cancel deletion and keep the type
                  </div>
                </div>
              </template>
            </v-radio>
          </v-radio-group>

          <div
            v-if="orphanedDataAction === 'migrate'"
            class="mt-4"
          >
            <v-select
              v-if="itemToDelete?.type === 'status'"
              v-model="migrationTargetStatus"
              :items="availableStatusTypes"
              label="Migrate to status type"
              required
            />

            <v-select
              v-else
              v-model="migrationTargetEvent"
              :items="availableEventTypes"
              label="Migrate to event type"
              required
            />
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            size="large"
            min-width="100"
            @click="showDataManagementDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="isProcessingData"
            size="large"
            min-width="160"
            @click="handleDataManagement"
          >
            {{ orphanedDataAction === 'keep' ? 'Keep Type' : 'Process Data' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../../stores/appStore';
import type { CustomStatusType, CustomTeacherEventType, ValidationResult, MigrationResult } from '../../types';
import { validateCustomStatusType, validateCustomTeacherEventType } from '../../utils/validation';
import { componentLogger } from '../../services/logger';

const store = useAppStore();

// Form refs and validation
const statusForm = ref<{ resetValidation: () => void } | null>(null);
const eventForm = ref<{ resetValidation: () => void } | null>(null);
const editStatusForm = ref<{ resetValidation: () => void } | null>(null);
const editEventForm = ref<{ resetValidation: () => void } | null>(null);
const statusFormValid = ref(false);
const eventFormValid = ref(false);
const editStatusFormValid = ref(false);
const editEventFormValid = ref(false);

// Form data
const newStatusName = ref('');
const newStatusColor = ref('#1976D2');
const newStatusIncludeMemo = ref(false);
const newEventName = ref('');
const newEventIncludeMemo = ref(false);

// Loading states
const isAddingStatus = ref(false);
const isAddingEvent = ref(false);

// Dialog states
const showEditStatusDialog = ref(false);
const showEditEventDialog = ref(false);
const showConfirmDialog = ref(false);

// Editing data
const editingStatus = ref<CustomStatusType>({
  id: '',
  name: '',
  color: '#1976D2',
  includeMemo: false,
  createdAt: '',
});
const editingEvent = ref<CustomTeacherEventType>({
  id: '',
  name: '',
  includeMemo: false,
  createdAt: '',
});

// Delete confirmation
const itemToDelete = ref<{ type: 'status' | 'event'; id: string; name: string } | null>(null);

// Data management dialog
const showDataManagementDialog = ref(false);
const orphanedDataAction = ref<'delete' | 'migrate' | 'keep'>('migrate');
const migrationTargetStatus = ref('IN CLASS');
const migrationTargetEvent = ref('PHONE VIOLATION');
const isProcessingData = ref(false);

// Data validation and backup
const validationResults = ref<{ orphanedStatuses: string[]; orphanedEvents: string[] } | null>(null);
const isValidating = ref(false);
const isExporting = ref(false);
const isImporting = ref(false);
const isClearingData = ref(false);
const showImportDialog = ref(false);
const showClearDataDialog = ref(false);
const backupFile = ref<File | null>(null);
const importFile = ref<File | null>(null);

// Validation state
const statusValidation = ref<ValidationResult | null>(null);
const eventValidation = ref<ValidationResult | null>(null);
const editStatusValidation = ref<ValidationResult | null>(null);

// Migration result state
const showMigrationErrorDialog = ref(false);
const showMigrationSuccessDialog = ref(false);
const migrationError = ref('');
const migrationResultData = ref<MigrationResult | null>(null);
const migrationSuccessData = ref<MigrationResult | null>(null);

// Computed properties
const customStatusTypes = computed(() => store.customStatusTypes);
const customTeacherEventTypes = computed(() => store.customTeacherEventTypes);

const availableStatusTypes = computed(() => [
  'IN CLASS',
  'RESTROOM',
  'OFFICE',
  'COUNSELOR',
  'LIBRARY',
  'TEACHER VISIT',
  ...customStatusTypes.value
    .filter(s => s.name !== (itemToDelete.value?.name ?? ''))
    .map(s => s.name),
]);

const availableEventTypes = computed(() => [
  'PHONE VIOLATION',
  'BAD LANGUAGE',
  'SEATING VIOLATION',
  'HORSE PLAY',
  ...customTeacherEventTypes.value
    .filter(e => e.name !== (itemToDelete.value?.name ?? ''))
    .map(e => e.name),
]);

// Methods
const addStatusType = async (): Promise<void> => {
  if (!statusFormValid.value) return;

  isAddingStatus.value = true;
  try {
    await store.addCustomStatusType(newStatusName.value, newStatusColor.value, newStatusIncludeMemo.value);
    newStatusName.value = '';
    newStatusColor.value = '#1976D2';
    newStatusIncludeMemo.value = false;
    statusForm.value?.resetValidation();
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to add status type', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isAddingStatus.value = false;
  }
};

const addEventType = async (): Promise<void> => {
  if (!eventFormValid.value) return;

  isAddingEvent.value = true;
  try {
    await store.addCustomTeacherEventType(newEventName.value, newEventIncludeMemo.value);
    newEventName.value = '';
    newEventIncludeMemo.value = false;
    eventForm.value?.resetValidation();
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to add event type', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isAddingEvent.value = false;
  }
};

const editStatusType = (status: CustomStatusType): void => {
  editingStatus.value = { ...status };
  showEditStatusDialog.value = true;
};

const editEventType = (event: CustomTeacherEventType): void => {
  editingEvent.value = { ...event };
  showEditEventDialog.value = true;
};

const updateStatusType = async (): Promise<void> => {
  if (!editStatusFormValid.value) return;

  try {
    await store.updateCustomStatusType(
      editingStatus.value.id,
      editingStatus.value.name,
      editingStatus.value.color,
      editingStatus.value.includeMemo,
    );
    showEditStatusDialog.value = false;
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to update status type', error instanceof Error ? error : new Error('Unknown error'));
  }
};

const updateEventType = async (): Promise<void> => {
  if (!editEventFormValid.value) return;

  try {
    await store.updateCustomTeacherEventType(
      editingEvent.value.id,
      editingEvent.value.name,
      editingEvent.value.includeMemo,
    );
    showEditEventDialog.value = false;
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to update event type', error instanceof Error ? error : new Error('Unknown error'));
  }
};

const removeStatusType = (id: string): void => {
  const statusType = customStatusTypes.value.find(s => s.id === id);
  if (!statusType) return;

  // Check for orphaned data
  const validation = store.validateTransactionData();
  const hasOrphanedData = validation.orphanedStatuses.includes(statusType.name);

  if (hasOrphanedData) {
    // Show data management dialog
    showDataManagementDialog.value = true;
    itemToDelete.value = { type: 'status', id, name: statusType.name };
  } else {
    // Safe to delete
    itemToDelete.value = { type: 'status', id, name: statusType.name };
    showConfirmDialog.value = true;
  }
};

const removeEventType = (id: string): void => {
  const eventType = customTeacherEventTypes.value.find(e => e.id === id);
  if (!eventType) return;

  // Check for orphaned data
  const validation = store.validateTransactionData();
  const hasOrphanedData = validation.orphanedEvents.includes(eventType.name);

  if (hasOrphanedData) {
    // Show data management dialog
    showDataManagementDialog.value = true;
    itemToDelete.value = { type: 'event', id, name: eventType.name };
  } else {
    // Safe to delete
    itemToDelete.value = { type: 'event', id, name: eventType.name };
    showConfirmDialog.value = true;
  }
};

const confirmDelete = async (): Promise<void> => {
  if (!itemToDelete.value) return;

  try {
    if (itemToDelete.value.type === 'status') {
      await store.removeCustomStatusType(itemToDelete.value.id);
    } else {
      await store.removeCustomTeacherEventType(itemToDelete.value.id);
    }
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to delete item', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    showConfirmDialog.value = false;
    itemToDelete.value = null;
  }
};

const handleDataManagement = async (): Promise<void> => {
  if (!itemToDelete.value) return;

  isProcessingData.value = true;

  try {
    if (orphanedDataAction.value === 'keep') {
      // Just close the dialog
      showDataManagementDialog.value = false;
      itemToDelete.value = null;
      return;
    }

    let migrationResult: MigrationResult | null = null;

    if (orphanedDataAction.value === 'migrate') {
      // Perform migration
      if (itemToDelete.value.type === 'status') {
        migrationResult = await store.performDataMigration('status', itemToDelete.value.name, migrationTargetStatus.value);
      } else {
        migrationResult = await store.performDataMigration('event', itemToDelete.value.name, migrationTargetEvent.value);
      }
    } else if (orphanedDataAction.value === 'delete') {
      // Clean up orphaned data
      migrationResult = await store.cleanupOrphanedTransactions({
        orphanedStatusAction: itemToDelete.value.type === 'status' ? 'delete' : 'keep',
        orphanedEventAction: itemToDelete.value.type === 'event' ? 'delete' : 'keep',
      });
    }

    // Check migration result
    if (migrationResult && !migrationResult.success) {
      // Show error dialog
      showMigrationErrorDialog.value = true;
      migrationError.value = migrationResult.error ?? 'Migration failed';
      migrationResultData.value = migrationResult;
      return;
    }

    // Now delete the type
    if (itemToDelete.value.type === 'status') {
      await store.removeCustomStatusType(itemToDelete.value.id);
    } else {
      await store.removeCustomTeacherEventType(itemToDelete.value.id);
    }

    showDataManagementDialog.value = false;
    itemToDelete.value = null;

    // Reset form
    orphanedDataAction.value = 'migrate';
    migrationTargetStatus.value = 'IN CLASS';
    migrationTargetEvent.value = 'PHONE VIOLATION';

    // Show success message
    if (migrationResult && migrationResult.success) {
      showMigrationSuccessDialog.value = true;
      migrationSuccessData.value = migrationResult;
    }

  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to process data management', error instanceof Error ? error : new Error('Unknown error'));
    migrationError.value = error instanceof Error ? error.message : 'Unknown error occurred';
    showMigrationErrorDialog.value = true;
  } finally {
    isProcessingData.value = false;
  }
};

// Data validation and backup methods
const validateData = (): void => {
  isValidating.value = true;
  try {
    validationResults.value = store.validateTransactionData();
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to validate data', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isValidating.value = false;
  }
};

const exportBackup = (): void => {
  isExporting.value = true;
  try {
    const backupData = store.exportDatabaseBackup();
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scholartrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to export backup', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isExporting.value = false;
  }
};

const handleBackupFileChange = (file: File | null): void => {
  backupFile.value = file;
};

const importBackup = async (): Promise<void> => {
  if (!importFile.value) return;

  isImporting.value = true;
  try {
    const text = await importFile.value.text();
    await store.importDatabaseBackup(text);
    showImportDialog.value = false;
    importFile.value = null;
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to import backup', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isImporting.value = false;
  }
};

const clearAllData = async (): Promise<void> => {
  isClearingData.value = true;
  try {
    await store.clearAllData();
    showClearDataDialog.value = false;
  } catch (error) {
    componentLogger.error('ManageTransactionsMode', 'Failed to clear data', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isClearingData.value = false;
  }
};

// Validation functions
const getStatusNameRules = (): ((v: string) => boolean | string)[] => [
  (v: string): boolean | string => !!v || 'Status name is required',
  (v: string): boolean | string => v.length >= 2 || 'Status name must be at least 2 characters',
  (v: string): boolean | string => v.length <= 50 || 'Status name cannot exceed 50 characters',
];

const getEventNameRules = (): ((v: string) => boolean | string)[] => [
  (v: string): boolean | string => !!v || 'Event name is required',
  (v: string): boolean | string => v.length >= 2 || 'Event name must be at least 2 characters',
  (v: string): boolean | string => v.length <= 50 || 'Event name cannot exceed 50 characters',
];

const getEditStatusNameRules = (): ((v: string) => boolean | string)[] => [
  (v: string): boolean | string => !!v || 'Status name is required',
  (v: string): boolean | string => v.length >= 2 || 'Status name must be at least 2 characters',
  (v: string): boolean | string => v.length <= 50 || 'Status name cannot exceed 50 characters',
];

const validateStatusName = (): void => {
  const existingNames = [
    ...customStatusTypes.value.map(s => s.name),
    ...customTeacherEventTypes.value.map(e => e.name),
  ];
  statusValidation.value = validateCustomStatusType(newStatusName.value, '#1976D2', existingNames);
};

const validateEventName = (): void => {
  const existingNames = [
    ...customStatusTypes.value.map(s => s.name),
    ...customTeacherEventTypes.value.map(e => e.name),
  ];
  eventValidation.value = validateCustomTeacherEventType(newEventName.value, existingNames);
};

const validateEditStatusName = (): void => {
  const existingNames = [
    ...customStatusTypes.value.filter(s => s.id !== editingStatus.value.id).map(s => s.name),
    ...customTeacherEventTypes.value.map(e => e.name),
  ];
  editStatusValidation.value = validateCustomStatusType(editingStatus.value.name, editingStatus.value.color, existingNames);
};

// Ensure database is ready when component mounts
onMounted((): void => {
  void (async (): Promise<void> => {
    try {
      // This will ensure the database is initialized and all object stores exist
      await store.ensureDBReady();
    } catch (error) {
      componentLogger.error('ManageTransactionsMode', 'Failed to ensure database readiness', error instanceof Error ? error : new Error('Unknown error'));
    }
  })();
});
</script>
