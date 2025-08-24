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
                      <span class="preview-title">ScholarTrack</span>
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
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../../stores/appStore'


const store = useAppStore()

// Form data
const primaryColor = ref('#1976D2')
const secondaryColor = ref('#424242')
const logoFile = ref<File | null>(null)
const logoPreview = ref<string>('')
const saving = ref(false)
const showSuccess = ref(false)

// Validation rules
const rules = {
  imageSize: (value: File | null) => {
    if (!value) return true
    const maxSize = 2 * 1024 * 1024 // 2MB
    return value.size <= maxSize || 'Image must be less than 2MB'
  },
  imageType: (value: File | null) => {
    if (!value) return true
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
    return allowedTypes.includes(value.type) || 'Please upload a PNG, JPG, or SVG file'
  }
}

// Form validation
const isValid = computed(() => {
  return primaryColor.value && secondaryColor.value
})

// Preview styles
const previewStyles = computed(() => ({
  '--primary-color': primaryColor.value,
  '--secondary-color': secondaryColor.value
}))

// Load existing settings
onMounted(() => {
  const settings = store.getStyleSettings()
  if (settings) {
    primaryColor.value = settings.primaryColor
    secondaryColor.value = settings.secondaryColor
    if (settings.logoImage) {
      logoPreview.value = settings.logoImage
    }
  }
})

// Update colors
const updatePrimaryColor = (color: string) => {
  primaryColor.value = color
}

const updateSecondaryColor = (color: string) => {
  secondaryColor.value = color
}

// Handle logo upload
const handleLogoUpload = (file: File | null) => {
  if (!file) {
    logoPreview.value = ''
    return
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml']
  if (!allowedTypes.includes(file.type)) {
    console.error('Invalid file type:', file.type)
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// Remove logo
const removeLogo = () => {
  logoFile.value = null
  logoPreview.value = ''
}

// Save settings
const saveSettings = async () => {
  if (!isValid.value) return

  saving.value = true
  
  try {
    await store.updateStyleSettings({
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      logoImage: logoPreview.value
    })
    
    showSuccess.value = true
  } catch (error) {
    console.error('Error saving style settings:', error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.preview-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: white;
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
