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
                  Preview
                </v-card-title>

                <v-card-text>
                  <div class="preview-container" :style="previewStyles">
                    <div class="preview-header">
                      <img v-if="logoPreview" :src="logoPreview" class="preview-logo" />
                      <span class="preview-title">{{ schoolName }}</span>
                    </div>
                    <div class="preview-content">
                      <div class="preview-button">Sample Button</div>
                      <div class="preview-chip">Sample Chip</div>
                    </div>
                  </div>
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

// Preview styles
const previewStyles = computed(() => ({
  '--primary-color': primaryColor.value,
  '--secondary-color': secondaryColor.value,
  '--tertiary-color': tertiaryColor.value,
  '--quaternary-color': quaternaryColor.value,
  'background-color': tertiaryColor.value,
}));

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
    console.error('Invalid file type:', file.type, 'File extension:', fileExtension);
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

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(compressedDataUrl);
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
    console.error('Error saving style settings:', error);
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.preview-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: var(--tertiary-color, white);
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: var(--primary-color);
  color: white;
  border-radius: 4px;
}

.preview-logo {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.preview-title {
  font-weight: bold;
  font-size: 18px;
}

.preview-content {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-button {
  background: var(--primary-color);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.preview-chip {
  background: var(--secondary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
}
</style>

