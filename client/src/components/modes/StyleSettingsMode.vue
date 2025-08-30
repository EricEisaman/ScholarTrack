<template>
  <div class="style-settings-mode">
    <v-card class="mx-auto" max-width="800">
      <v-card-title class="text-h5">
        <v-icon class="mr-2">mdi-palette</v-icon>
        Style Settings
      </v-card-title>

      <v-card-text>
        <v-form @submit.prevent="saveSettings">
          <!-- Color Settings -->
          <v-row>
            <v-col cols="12" md="6">
              <v-color-picker
                v-model="primaryColor"
                mode="hex"
                hide-inputs
                class="mb-4"
              />
              <v-text-field
                v-model="primaryColor"
                label="Primary Color"
                variant="outlined"
                prepend-icon="mdi-palette"
                @update:model-value="updatePrimaryColor"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-color-picker
                v-model="secondaryColor"
                mode="hex"
                hide-inputs
                class="mb-4"
              />
              <v-text-field
                v-model="secondaryColor"
                label="Secondary Color"
                variant="outlined"
                prepend-icon="mdi-palette-outline"
                @update:model-value="updateSecondaryColor"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-color-picker
                v-model="tertiaryColor"
                mode="hex"
                hide-inputs
                class="mb-4"
              />
              <v-text-field
                v-model="tertiaryColor"
                label="Tertiary Color (Background)"
                variant="outlined"
                prepend-icon="mdi-palette-swatch"
                @update:model-value="updateTertiaryColor"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-color-picker
                v-model="quaternaryColor"
                mode="hex"
                hide-inputs
                class="mb-4"
              />
              <v-text-field
                v-model="quaternaryColor"
                label="Quaternary Color"
                variant="outlined"
                prepend-icon="mdi-palette-swatch-variant"
                @update:model-value="updateQuaternaryColor"
              />
            </v-col>
          </v-row>

          <!-- School Name -->
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="schoolName"
                label="School Name"
                variant="outlined"
                prepend-icon="mdi-school"
                placeholder="Enter your school name"
                :rules="[rules.required]"
              />
            </v-col>
          </v-row>

          <!-- Logo Upload -->
          <v-row>
            <v-col cols="12">
              <v-card variant="outlined" class="pa-4">
                <v-card-title class="text-h6">
                  <v-icon class="mr-2">mdi-image</v-icon>
                  School Logo
                </v-card-title>

                <v-card-text>
                  <v-file-input
                    v-model="logoFile"
                    accept=".png,.jpg,.jpeg,.svg"
                    label="Upload Logo (PNG, JPG, SVG)"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    @change="handleLogoUpload"
                    :rules="[rules.imageSize, rules.imageType]"
                  />

                  <!-- Logo Preview -->
                  <div v-if="logoPreview" class="mt-4">
                    <v-card variant="outlined" class="pa-4 text-center">
                      <v-img
                        :src="logoPreview"
                        max-width="200"
                        max-height="200"
                        class="mx-auto"
                        contain
                        bg-color="transparent"
                      />
                      <v-btn
                        color="error"
                        variant="text"
                        size="small"
                        class="mt-2"
                        @click="removeLogo"
                      >
                        Remove Logo
                      </v-btn>
                    </v-card>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Preview -->
          <v-row>
            <v-col cols="12">
              <v-card variant="outlined" class="pa-4">
                <v-card-title class="text-h6">
                  <v-icon class="mr-2">mdi-eye</v-icon>
                  Application Preview
                </v-card-title>

                <v-card-text>
                  <v-card class="preview-container" :color="tertiaryColor" max-height="800">
                    <!-- App Bar Preview -->
                    <v-app-bar :color="primaryColor" dark>
                      <v-select
                        model-value="Standard Mode"
                        :items="['Standard Mode']"
                        variant="outlined"
                        density="comfortable"
                        class="mr-4"
                        hide-details
                        readonly
                      >
                        <template #prepend-inner>
                          <v-icon size="small" class="mr-2">mdi-account-group</v-icon>
                        </template>
                      </v-select>

                      <v-spacer />

                      <div class="d-flex align-center">
                        <v-img
                          v-if="logoPreview"
                          :src="logoPreview"
                          width="24"
                          height="24"
                          class="mr-3"
                          contain
                          bg-color="transparent"
                        />
                        <div class="d-flex flex-column align-center">
                          <span class="text-h6 font-weight-bold">{{ schoolName }}</span>
                          <span class="text-caption text-medium-emphasis">ScholarTrack</span>
                        </div>
                      </div>

                      <v-spacer />

                      <v-select
                        model-value="Math 101"
                        :items="['Math 101']"
                        variant="outlined"
                        density="comfortable"
                        class="mr-4"
                        hide-details
                        readonly
                      >
                        <template #prepend-inner>
                          <v-icon size="small" class="mr-2">mdi-account-group</v-icon>
                        </template>
                      </v-select>

                      <v-chip :color="secondaryColor" class="text-caption">
                        Standard
                      </v-chip>
                    </v-app-bar>

                    <!-- Main Content Preview -->
                    <v-container class="pa-6">
                      <!-- Header Card -->
                      <v-card class="mb-3">
                        <v-card-title class="d-flex align-center">
                          <v-icon class="mr-2">mdi-account-group</v-icon>
                          <span class="text-truncate">Math 101</span>
                          <v-spacer />
                          <v-chip :color="primaryColor" variant="outlined">
                            24 Students
                          </v-chip>
                        </v-card-title>

                        <v-card-text>
                          <!-- Student Grid Preview -->
                          <v-row>
                            <v-col cols="6" sm="3" v-for="(student, index) in previewStudents" :key="index">
                              <v-card
                                :color="student.color"
                                class="student-preview-card"
                                @click="() => {}"
                              >
                                <v-card-text class="text-center pa-2">
                                  <div class="text-body-2 font-weight-bold">{{ student.name }}</div>
                                  <div class="text-h6 mb-1">{{ student.emoji }}</div>
                                  <div class="text-caption">{{ student.status }}</div>
                                </v-card-text>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>

                      <!-- Data Table Preview -->
                      <v-card class="mb-3">
                        <v-card-title class="d-flex align-center">
                          <v-icon class="mr-2">mdi-account</v-icon>
                          <span>Student Management</span>
                        </v-card-title>

                        <v-data-table
                          :headers="previewTableHeaders"
                          :items="previewTableItems"
                          :items-per-page="1"
                          hide-default-footer
                          class="elevation-1"
                        >
                          <template v-slot:item.emoji="{ item }">
                            <span class="text-h6">{{ item.emoji }}</span>
                          </template>

                          <template v-slot:item.classes="{ item }">
                            <v-chip size="small" :color="secondaryColor">
                              {{ item.classes }}
                            </v-chip>
                          </template>

                          <template v-slot:item.status="{ item }">
                            <v-chip size="small" color="success">
                              {{ item.status }}
                            </v-chip>
                          </template>

                          <template v-slot:item.actions>
                            <v-btn
                              :color="primaryColor"
                              variant="outlined"
                              size="small"
                            >
                              Edit
                            </v-btn>
                          </template>
                        </v-data-table>
                      </v-card>

                      <!-- Form Preview -->
                      <v-card class="mb-4">
                        <v-card-title class="d-flex align-center">
                          <v-icon class="mr-2">mdi-plus</v-icon>
                          <span>Add New Student</span>
                        </v-card-title>

                        <v-card-text>
                          <v-form>
                            <v-text-field
                              model-value=""
                              label="Student Name"
                              variant="outlined"
                              prepend-inner-icon="mdi-account"
                              placeholder="Enter student name..."
                              readonly
                            />

                            <v-select
                              model-value="😊"
                              :items="['😊']"
                              label="Emoji"
                              variant="outlined"
                              readonly
                            />

                            <v-btn
                              :color="primaryColor"
                              variant="elevated"
                              class="mt-4"
                            >
                              Add Student
                            </v-btn>
                          </v-form>
                        </v-card-text>
                      </v-card>

                      <!-- Dialog Preview -->
                      <v-dialog v-model="showPreviewDialog" max-width="400" persistent>
                        <v-card :color="quaternaryColor">
                          <v-card-title class="d-flex align-center">
                            <v-icon class="mr-2">mdi-account</v-icon>
                            <span>Edit Student</span>
                            <v-spacer />
                            <v-btn icon @click="showPreviewDialog = false">
                              <v-icon>mdi-close</v-icon>
                            </v-btn>
                          </v-card-title>

                          <v-card-text>
                            <v-text-field
                              model-value="John Doe"
                              label="Student Name"
                              variant="outlined"
                              readonly
                            />
                          </v-card-text>

                          <v-card-actions>
                            <v-spacer />
                            <v-btn @click="showPreviewDialog = false">
                              Cancel
                            </v-btn>
                            <v-btn :color="primaryColor" variant="elevated">
                              Save Changes
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>

                      <!-- Quick Actions -->
                      <v-card>
                        <v-card-title class="text-subtitle-1">
                          <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
                          Quick Actions
                        </v-card-title>
                        <v-card-text>
                          <v-row>
                            <v-col cols="auto">
                              <v-btn
                                :color="quaternaryColor"
                                variant="outlined"
                                prepend-icon="mdi-account-plus"
                              >
                                Add Student
                              </v-btn>
                            </v-col>
                            <v-col cols="auto">
                              <v-btn
                                :color="secondaryColor"
                                variant="outlined"
                                prepend-icon="mdi-chart-line"
                              >
                                View Reports
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-container>
                  </v-card>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn
          color="primary"
          variant="elevated"
          @click="saveSettings"
          :loading="saving"
          :disabled="!isValid"
        >
          <v-icon class="mr-2">mdi-content-save</v-icon>
          Save Settings
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
    >
      Style settings saved successfully!
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { componentLogger } from '../../services/logger';

const store = useAppStore();

// Form data
const primaryColor = ref('#1976D2');
const secondaryColor = ref('#424242');
const tertiaryColor = ref('#000000');
const quaternaryColor = ref('#121212');
const schoolName = ref('ScholarTrack');
const logoFile = ref<File | null>(null);
const logoPreview = ref<string>('');
const saving = ref(false);
const showSuccess = ref(false);

// Preview data
const previewStudents = ref([
  { name: 'John D.', emoji: '😊', status: 'Present', color: 'rgba(76, 175, 80, 0.2)' },
  { name: 'Sarah M.', emoji: '😴', status: 'Absent', color: 'rgba(244, 67, 54, 0.2)' },
  { name: 'Mike R.', emoji: '🏃', status: 'Late', color: 'rgba(255, 152, 0, 0.2)' },
  { name: 'Lisa K.', emoji: '📚', status: 'Present', color: 'rgba(76, 175, 80, 0.2)' },
]);

const previewTableHeaders = ref([
  { title: 'Name', key: 'name', align: 'start' as const },
  { title: 'Emoji', key: 'emoji', align: 'center' as const },
  { title: 'Classes', key: 'classes', align: 'center' as const },
  { title: 'Status', key: 'status', align: 'center' as const },
  { title: 'Actions', key: 'actions', align: 'center' as const },
]);

const previewTableItems = ref([
  { name: 'John Doe', emoji: '😊', classes: 'Math 101', status: 'Present' },
  { name: 'Sarah M.', emoji: '😴', classes: 'Math 101', status: 'Absent' },
  { name: 'Mike R.', emoji: '🏃', classes: 'Math 101', status: 'Late' },
  { name: 'Lisa K.', emoji: '📚', classes: 'Math 101', status: 'Present' },
]);

const showPreviewDialog = ref(false);

// Validation rules
const rules = {
  required: (value: string) => !!value || 'This field is required',
  imageSize: (value: File | null) => {
    if (!value) return true;
    const maxSize = 2 * 1024 * 1024; // 2MB
    return value.size <= maxSize || 'Image must be less than 2MB';
  },
  imageType: (value: File | null) => {
    if (!value) return true;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    const fileExtension = value.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

    const isValidType = allowedTypes.includes(value.type) ||
                       (fileExtension && allowedExtensions.includes(fileExtension));

    return isValidType || 'Please upload a PNG, JPG, JPEG, WebP, or SVG file';
  },
};

// Form validation
const isValid = computed(() => {
  return primaryColor.value && secondaryColor.value;
});

// Load existing settings
onMounted(() => {
  const settings = store.getStyleSettings();
  if (settings) {
    primaryColor.value = settings.primaryColor;
    secondaryColor.value = settings.secondaryColor;
    tertiaryColor.value = settings.tertiaryColor || '#000000';
    quaternaryColor.value = settings.quaternaryColor || '#121212';
    schoolName.value = settings.schoolName || 'ScholarTrack';
    if (settings.logoImage) {
      logoPreview.value = settings.logoImage;
    }
  }
});

// Update colors
const updatePrimaryColor = (color: string) => {
  primaryColor.value = color;
};

const updateSecondaryColor = (color: string) => {
  secondaryColor.value = color;
};

const updateTertiaryColor = (color: string) => {
  tertiaryColor.value = color;
};

const updateQuaternaryColor = (color: string) => {
  quaternaryColor.value = color;
};

// Handle logo upload
const handleLogoUpload = (event: Event | File | null) => {
  // Handle different event types
  let file: File | null = null;

  if (event instanceof File) {
    file = event;
  } else if (event && 'target' in event && event.target) {
    const target = event.target as HTMLInputElement;
    file = target.files?.[0] || null;
  } else {
    file = null;
  }

  if (!file) {
    logoPreview.value = '';
    return;
  }

  // Validate file type - support PNG, JPG, JPEG, WebP
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
  const fileExtension = file.name.toLowerCase().split('.').pop();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

  const isValidType = allowedTypes.includes(file.type) ||
                     (fileExtension && allowedExtensions.includes(fileExtension));

  if (!isValidType) {
    componentLogger.error('StyleSettingsMode', 'Invalid file type', new Error('Invalid file type'), { fileType: file.type, fileExtension });
    return;
  }

  // Compress image to reduce payload size
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 512x512)
        const maxSize = 512;
        let { width, height } = img;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Clear canvas with transparent background
        ctx?.clearRect(0, 0, width, height);

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Use PNG format for transparency support, JPEG for photos
        const isPNG = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
        const isSVG = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
        
        if (isPNG || isSVG) {
          // Preserve transparency for PNG and SVG
          const compressedDataUrl = canvas.toDataURL('image/png');
          resolve(compressedDataUrl);
        } else {
          // Use JPEG for photos (JPG, JPEG, WebP)
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedDataUrl);
        }
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Compress and set the logo
  compressImage(file).then((compressedDataUrl) => {
    logoPreview.value = compressedDataUrl;
  });
};

// Remove logo
const removeLogo = () => {
  logoFile.value = null;
  logoPreview.value = '';
};

// Save settings
const saveSettings = async () => {
  if (!isValid.value) return;

  saving.value = true;

  try {
    await store.updateStyleSettings({
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      tertiaryColor: tertiaryColor.value,
      quaternaryColor: quaternaryColor.value,
      schoolName: schoolName.value,
      logoImage: logoPreview.value,
    });

    showSuccess.value = true;
  } catch (error) {
    componentLogger.error('StyleSettingsMode', 'Error saving style settings', error instanceof Error ? error : new Error('Unknown error'));
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
</style>

