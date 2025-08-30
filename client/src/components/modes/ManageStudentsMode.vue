<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <!-- Add Student Section -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            Add New Student
          </v-card-title>

          <v-card-text>
            <v-form ref="addForm" v-model="addFormValid">
              <v-text-field
                v-model="newStudent.label"
                label="Student Label (2 letters)"
                :rules="[
                  v => !!v || 'Label is required',
                  v => v.length === 2 || 'Label must be exactly 2 letters',
                  v => /^[A-Z]{2}$/.test(v) || 'Label must be 2 uppercase letters'
                ]"
                maxlength="2"
                required
                clearable
                @keyup.enter="addStudent"
              ></v-text-field>

              <v-text-field
                v-model="newStudent.code"
                label="4-digit Code"
                :rules="[
                  v => !!v || 'Code is required',
                  v => /^\d{4}$/.test(v) || 'Code must be exactly 4 digits'
                ]"
                maxlength="4"
                required
                clearable
                @keyup.enter="addStudent"
              ></v-text-field>

              <v-text-field
                v-model="newStudent.emoji"
                label="Emoji"
                :rules="[v => !!v || 'Emoji is required']"
                required
                clearable
                readonly
                @click="showEmojiPicker = true"
                @keyup.enter="addStudent"
                prepend-inner-icon="mdi-emoticon"
              ></v-text-field>

              <v-select
                v-model="newStudent.classes"
                :items="availableClasses"
                label="Classes"
                multiple
                chips
                :rules="[v => v.length > 0 || 'At least one class must be selected']"
                required
                @keyup.enter="addStudent"
              ></v-select>

              <!-- Student Preview -->
              <v-card
                v-if="newStudent.label && newStudent.emoji"
                variant="outlined"
                class="mt-4 pa-3"
              >
                <div class="text-center">
                  <div class="text-h4 mb-2">{{ newStudent.emoji }}</div>
                  <div class="text-h6">{{ newStudent.label }}</div>
                  <div class="text-caption text-grey">
                    Status: IN CLASS
                  </div>
                </div>
              </v-card>

              <v-btn
                color="quaternary"
                variant="elevated"
                :disabled="!addFormValid"
                :loading="isAdding"
                @click="addStudent"
                class="mt-4"
              >
                Add Student
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <!-- Student Statistics -->
        <v-card class="mb-4">
          <v-card-title class="text-h5">
            Student Statistics
          </v-card-title>

          <v-card-text>
            <v-list>
              <v-list-item>
                <v-list-item-title>Total Students</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="primary">{{ students.length }}</v-chip>
                </template>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Total Classes</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="secondary">{{ classes.length }}</v-chip>
                </template>
              </v-list-item>

              <v-list-item>
                <v-list-item-title>Students in Current Class</v-list-item-title>
                <template v-slot:append>
                  <v-chip color="success">{{ currentClassStudents.length }}</v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Students List -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="text-h5">
            Manage Students
          </v-card-title>

          <v-card-text>
            <v-alert
              v-if="students.length === 0"
              type="info"
              variant="tonal"
              class="mb-4"
            >
              No students available. Add your first student above.
            </v-alert>

            <v-data-table
              v-else
              :headers="headers"
              :items="students"
              :items-per-page="10"
              class="elevation-1"
            >
              <template v-slot:item.emoji="{ item }">
                <span class="text-h5">{{ item.emoji }}</span>
              </template>

              <template v-slot:item.classes="{ item }">
                <v-chip
                  v-for="className in item.classes"
                  :key="className"
                  size="small"
                  class="mr-1"
                >
                  {{ className }}
                </v-chip>
              </template>

              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item)"
                  size="small"
                >
                  {{ getStudentStatus(item) }}
                </v-chip>
              </template>

              <template v-slot:item.createdAt="{ item }">
                {{ new Date(item.createdAt).toLocaleDateString() }}
              </template>

              <template v-slot:item.actions="{ item }">
                <v-btn
                  color="primary"
                  variant="outlined"
                  size="small"
                  class="mr-2"
                  @click="editStudent(item)"
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

    <!-- Edit Student Dialog -->
    <v-dialog v-model="showEditDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          Edit Student
        </v-card-title>

        <v-card-text>
          <v-form ref="editForm" v-model="editFormValid">
            <v-text-field
              v-model="editingStudent!.label"
              label="Student Label"
              :rules="[
                v => !!v || 'Label is required',
                v => v.length === 2 || 'Label must be exactly 2 letters',
                v => /^[A-Z]{2}$/.test(v) || 'Label must be 2 uppercase letters'
              ]"
              maxlength="2"
              required
            ></v-text-field>

            <v-text-field
              v-model="editingStudent!.code"
              label="4-digit Code"
              :rules="[
                v => !!v || 'Code is required',
                v => /^\d{4}$/.test(v) || 'Code must be exactly 4 digits'
              ]"
              maxlength="4"
              required
            ></v-text-field>

                          <v-text-field
                v-model="editingStudent!.emoji"
                label="Emoji"
                :rules="[v => !!v || 'Emoji is required']"
                required
                readonly
                @click="showEditEmojiPicker = true"
                prepend-inner-icon="mdi-emoticon"
              ></v-text-field>

            <v-select
              v-model="editingStudent!.classes"
              :items="availableClasses"
              label="Classes"
              multiple
              chips
              :rules="[v => v.length > 0 || 'At least one class must be selected']"
              required
            ></v-select>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="cancelEdit"
            size="large"
            min-width="100"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :disabled="!editFormValid"
            :loading="isEditing"
            @click="saveStudent"
            size="large"
            min-width="140"
          >
            Save Changes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          Confirm Student Removal
        </v-card-title>

        <v-card-text>
          <p class="text-body-1">
            Are you sure you want to remove the student <strong>"{{ selectedStudent?.label }}"</strong>?
          </p>
          <p class="text-body-2 text-grey mt-2">
            This action cannot be undone.
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            variant="text"
            @click="cancelRemove"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            variant="elevated"
            :loading="isRemoving"
            @click="removeStudent"
          >
            Remove Student
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Emoji Pickers -->
    <EmojiPicker
      v-model="showEmojiPicker"
      @select="onEmojiSelect"
    />

    <EmojiPicker
      v-model="showEditEmojiPicker"
      @select="onEditEmojiSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useAppStore } from '../../stores/appStore';
import type { Student } from '../../types';
import EmojiPicker from '../EmojiPicker.vue';
import type { EmojiData } from '../../data/emojis';
import { componentLogger } from '../../services/logger';

const store = useAppStore();

// Local state
const newStudent = ref({
  label: '',
  code: '',
  emoji: '',
  classes: [] as string[],
});
const addFormValid = ref(false);
const isAdding = ref(false);
const showEditDialog = ref(false);
const showConfirmDialog = ref(false);
const editingStudent = ref<Student | null>(null);
const selectedStudent = ref<Student | null>(null);
const editFormValid = ref(false);
const isEditing = ref(false);
const isRemoving = ref(false);
const showEmojiPicker = ref(false);
const showEditEmojiPicker = ref(false);

// Form refs
const addForm = ref();
const editForm = ref();

// Computed properties
const students = computed(() => store.students);
const classes = computed(() => store.classes);
const currentClassStudents = computed(() => store.currentClassStudents);

const availableClasses = computed(() =>
  classes.value.map(c => ({ title: c.name, value: c.name })),
);

const headers = [
  { title: 'Emoji', key: 'emoji', sortable: false },
  { title: 'Label', key: 'label', sortable: true },
  { title: 'Code', key: 'code', sortable: true },
  { title: 'Classes', key: 'classes', sortable: false },
  { title: 'Status', key: 'status', sortable: true },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false },
];

// Methods
const addStudent = async () => {
  if (!addFormValid.value) return;

  isAdding.value = true;

  try {
    componentLogger.info('ManageStudentsMode', 'Attempting to add student', newStudent.value);
    await store.addStudent(newStudent.value);

    // Reset form data
    newStudent.value = { label: '', code: '', emoji: '', classes: [] };

    // Wait for DOM updates then reset validation
    await nextTick();
    addForm.value?.resetValidation();

    componentLogger.info('ManageStudentsMode', 'Student added successfully');
  } catch (error) {
    componentLogger.error('ManageStudentsMode', 'Failed to add student', error instanceof Error ? error : new Error('Unknown error'));
    // Show user-friendly error message
    alert(`Failed to add student: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isAdding.value = false;
  }
};

const editStudent = (student: Student) => {
  editingStudent.value = { ...student };
  showEditDialog.value = true;
};

const saveStudent = async () => {
  if (!editFormValid.value || !editingStudent.value) return;

  isEditing.value = true;

  try {
    componentLogger.info('ManageStudentsMode', 'Attempting to update student', editingStudent.value);
    await store.updateStudent(editingStudent.value);
    showEditDialog.value = false;
    editingStudent.value = null;
    editForm.value?.resetValidation();
    editFormValid.value = false;
    componentLogger.info('ManageStudentsMode', 'Student updated successfully');
  } catch (error) {
    componentLogger.error('ManageStudentsMode', 'Failed to update student', error instanceof Error ? error : new Error('Unknown error'));
    // Show user-friendly error message
    alert(`Failed to update student: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    isEditing.value = false;
  }
};

const cancelEdit = () => {
  showEditDialog.value = false;
  editingStudent.value = null;
  editForm.value?.resetValidation();
  editFormValid.value = false;
};

const cancelRemove = () => {
  showConfirmDialog.value = false;
  selectedStudent.value = null;
};

const confirmRemove = (student: Student) => {
  selectedStudent.value = student;
  showConfirmDialog.value = true;
};

const removeStudent = async () => {
  if (!selectedStudent.value) return;

  isRemoving.value = true;

  try {
    await store.removeStudent(selectedStudent.value.id);
    showConfirmDialog.value = false;
    selectedStudent.value = null;
  } catch (error) {
    componentLogger.error('ManageStudentsMode', 'Failed to remove student', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    isRemoving.value = false;
  }
};

const getStudentStatus = (student: Student): string => {
  return store.getStudentStatus(student.code);
};

const getStatusColor = (student: Student): string => {
  const status = getStudentStatus(student);
  return store.statusColors[status as keyof typeof store.statusColors] || '#1976D2';
};

const onEmojiSelect = (emoji: EmojiData) => {
  newStudent.value.emoji = emoji.emoji;
};

const onEditEmojiSelect = (emoji: EmojiData) => {
  if (editingStudent.value) {
    editingStudent.value.emoji = emoji.emoji;
  }
};
</script>
