<template>
  <div>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <!-- Add Class Section -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            Add New Class
          </v-card-title>

          <v-card-text>
            <v-form
              ref="addForm"
              v-model="addFormValid"
            >
              <v-text-field
                v-model="newClassName"
                label="Class Name"
                :rules="[v => !!v || 'Class name is required']"
                required
                clearable
                @keyup.enter="addClass"
              />

              <v-btn
                color="primary"
                variant="elevated"
                :disabled="!addFormValid"
                :loading="isAdding"
                class="mt-4"
                @click="addClass"
              >
                Add Class
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        md="6"
      >
        <!-- Class Statistics -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            Class Statistics
          </v-card-title>

          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Total Classes</v-list-item-title>
                <template #append>
                  <v-chip color="primary">
                    {{ classes.length }}
                  </v-chip>
                </template>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Total Students</v-list-item-title>
                <template #append>
                  <v-chip color="secondary">
                    {{ students.length }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Classes List -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            Manage Classes
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="classes.length === 0"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              No classes available. Add your first class above.
            </v-alert>

            <v-data-table
              v-else
              :headers="headers"
              :items="classes"
              :items-per-page="10"
              class="elevation-1"
            >
              <template #item.createdAt="{ item }">
                {{ new Date(item.createdAt).toLocaleDateString() }}
              </template>

              <template #item.studentCount="{ item }">
                <v-chip
                  :color="getStudentCountColor(item)"
                  size="small"
                >
                  {{ getStudentCount(item) }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  class="mr-2"
                  @click="editClass(item)"
                >
                  Edit
                </v-btn>
                <v-btn
                  color="error"
                  variant="outlined"
                  size="small"
                  @click="confirmRemove(item)"
                >
                  Remove
                </v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Class Dialog -->
    <v-dialog
      v-model="showEditDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h6">
          Edit Class
        </v-card-title>

        <v-card-text>
          <v-form
            ref="editForm"
            v-model="editFormValid"
          >
            <v-text-field
              v-model="editingClass!.name"
              label="Class Name"
              :rules="[v => !!v || 'Class name is required']"
              required
              clearable
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            size="large"
            min-width="100"
            @click="cancelEdit"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!editFormValid"
            :loading="isEditing"
            size="large"
            min-width="140"
            @click="saveClass"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog
      v-model="showConfirmDialog"
      max-width="500"
    >
      <v-card>
        <v-card-title class="text-h6">
          Confirm Class Removal
        </v-card-title>

        <v-card-text>
          <p class="text-body-1">
            Are you sure you want to remove the class <strong>"{{ selectedClass?.name }}"</strong>?
          </p>

          <v-alert
            type="warning"
            variant="tonal"
            class="mt-4"
          >
            <strong>This action will:</strong>
            <ul class="mt-2">
              <li>Remove the class from the system</li>
              <li v-if="exclusiveStudents.length > 0">
                Remove {{ exclusiveStudents.length }} student(s) who belong exclusively to this class:
                <ul class="mt-1">
                  <li
                    v-for="student in exclusiveStudents"
                    :key="student.id"
                  >
                    {{ student.label }} ({{ student.emoji }})
                  </li>
                </ul>
              </li>
              <li v-if="sharedStudents.length > 0">
                Remove this class from {{ sharedStudents.length }} student(s) who belong to multiple classes
              </li>
            </ul>
          </v-alert>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="grey"
            variant="text"
            size="large"
            min-width="100"
            @click="cancelRemove"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="isRemoving"
            size="large"
            min-width="160"
            @click="removeClass"
          >
            Remove Class
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';
import type { Class, Student } from '../../types';
import { componentLogger } from '../../services/logger';

const store = useAppStore();

// Local state
const newClassName = ref('');
const addFormValid = ref(false);
const isAdding = ref(false);
const showConfirmDialog = ref(false);
const selectedClass = ref<Class | null>(null);
const isRemoving = ref(false);
const showEditDialog = ref(false);
const editingClass = ref<Class | null>(null);
const editFormValid = ref(false);
const isEditing = ref(false);

// Form refs
const addForm = ref<{ resetValidation: () => void } | null>(null);
const editForm = ref<{ resetValidation: () => void } | null>(null);

// Computed properties
const classes = computed(() => store.classes);
const students = computed(() => store.students);

const headers = [
  { title: 'Class Name', key: 'name', sortable: true },
  { title: 'Students', key: 'studentCount', sortable: true },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Computed properties for confirmation dialog
const exclusiveStudents = computed(() => {
  if (!selectedClass.value) return [];

  return students.value.filter((student: Student) =>
    student.classes.length === 1 && student.classes.includes(selectedClass.value?.name ?? ''),
  );
});

const sharedStudents = computed(() => {
  if (!selectedClass.value) return [];

  return students.value.filter((student: Student) =>
    student.classes.length > 1 && student.classes.includes(selectedClass.value?.name ?? ''),
  );
});

// Methods
const addClass = async (): Promise<void> => {
  if (!addFormValid.value) return;

  isAdding.value = true;

  try {
    componentLogger.info('ManageClassesMode', 'Attempting to add class', { className: newClassName.value });
    await store.addClass(newClassName.value);
    componentLogger.info('ManageClassesMode', 'Class added successfully');
    newClassName.value = '';
    addForm.value?.resetValidation();
  } catch (error) {
    componentLogger.error('ManageClassesMode', 'Failed to add class', error instanceof Error ? error : new Error('Unknown error'));
    // Show user-friendly error message
    alert(`Failed to add class: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isAdding.value = false;
  }
};

const editClass = (item: Class): void => {
  editingClass.value = { ...item };
  showEditDialog.value = true;
};

const saveClass = async (): Promise<void> => {
  if (!editFormValid.value || !editingClass.value) return;

  isEditing.value = true;

  try {
    await store.updateClass(editingClass.value);
    showEditDialog.value = false;
    editingClass.value = null;
    editForm.value?.resetValidation();
    editFormValid.value = false;
  } catch (error) {
    componentLogger.error('ManageClassesMode', 'Failed to update class', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isEditing.value = false;
  }
};

const cancelEdit = (): void => {
  showEditDialog.value = false;
  editingClass.value = null;
  editForm.value?.resetValidation();
  editFormValid.value = false;
};

const confirmRemove = (item: Class): void => {
  selectedClass.value = item;
  showConfirmDialog.value = true;
};

const removeClass = async (): Promise<void> => {
  if (!selectedClass.value) return;

  isRemoving.value = true;

  try {
    await store.removeClass(selectedClass.value.id);
    showConfirmDialog.value = false;
    selectedClass.value = null;
  } catch (error) {
    componentLogger.error('ManageClassesMode', 'Failed to remove class', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isRemoving.value = false;
  }
};

const cancelRemove = (): void => {
  showConfirmDialog.value = false;
  selectedClass.value = null;
};

const getStudentCount = (classItem: Class): number => {
  return students.value.filter((student: Student) =>
    student.classes.includes(classItem.name),
  ).length;
};

const getStudentCountColor = (classItem: Class): string => {
  const count = getStudentCount(classItem);
  if (count === 0) return 'grey';
  if (count <= 5) return 'green';
  if (count <= 15) return 'orange';
  return 'red';
};
</script>
