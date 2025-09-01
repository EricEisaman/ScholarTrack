<template>
  <div
    class="style-settings-mode"
    :style="{ backgroundColor: designMode === 'advanced' ? pageBackgroundColor : undefined }"
  >
    <v-card
      class="mx-auto"
      max-width="800"
      :color="designMode === 'advanced' ? tertiaryColor : undefined"
    >
      <v-card-title
        class="text-h5"
        :style="{ color: designMode === 'advanced' ? secondaryColor : undefined }"
      >
        <v-icon class="mr-2">
          mdi-palette
        </v-icon>
        Style Settings
      </v-card-title>

      <!-- Design Mode Selection -->
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-card
              :color="designMode === 'advanced' ? tertiaryColor : undefined"
              class="pa-4"
            >
              <v-card-title
                class="text-h6"
                :style="{ color: designMode === 'advanced' ? secondaryColor : undefined }"
              >
                <v-icon class="mr-2">
                  mdi-tune
                </v-icon>
                Design Mode
              </v-card-title>
              <v-card-text>
                <v-radio-group
                  v-model="designMode"
                  inline
                >
                  <v-radio
                    value="smart"
                    label="Smart Design Mode"
                  >
                    <template #label>
                      <div class="d-flex align-center">
                        <v-icon class="mr-2">
                          mdi-magic-staff
                        </v-icon>
                        <span>Smart Design Mode</span>
                        <v-chip
                          size="small"
                          :color="designMode === 'advanced' ? primaryColor : 'primary'"
                          class="ml-2"
                        >
                          Recommended
                        </v-chip>
                      </div>
                    </template>
                  </v-radio>
                  <v-radio
                    value="advanced"
                    label="Advanced Color Design"
                  >
                    <template #label>
                      <div class="d-flex align-center">
                        <v-icon class="mr-2">
                          mdi-palette-advanced
                        </v-icon>
                        <span>Advanced Color Design</span>
                      </div>
                    </template>
                  </v-radio>
                </v-radio-group>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Smart Design Mode -->
      <v-card-text v-if="designMode === 'smart'">
        <v-form @submit.prevent="saveSettings">
          <v-row>
            <v-col cols="12">
              <v-card
                variant="outlined"
                class="pa-4"
              >
                <v-card-title class="text-h6">
                  <v-icon class="mr-2">
                    mdi-magic-staff
                  </v-icon>
                  Smart Palette Generation
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <v-select
                        v-model="colorScheme"
                        :items="[
                          { title: 'Monochromatic', value: 'monochromatic', subtitle: 'Single color with variations' },
                          { title: 'Adjacent', value: 'adjacent', subtitle: 'Colors next to each other on the color wheel' },
                          { title: 'Triadic', value: 'triadic', subtitle: 'Three colors equally spaced on the color wheel' },
                          { title: 'Tetrad', value: 'tetrad', subtitle: 'Four colors forming a rectangle on the color wheel' }
                        ]"
                        label="Color Scheme"
                        variant="outlined"
                        prepend-icon="mdi-palette-swatch"
                        item-title="title"
                        item-value="value"
                        @update:model-value="generateSmartColors"
                      />
                    </v-col>
                    <v-col
                      cols="12"
                      md="6"
                    >
                      <v-color-picker
                        v-model="baseColor"
                        mode="hex"
                        hide-inputs
                        class="mb-4"
                      />
                      <v-text-field
                        v-model="baseColor"
                        label="Base Color"
                        variant="outlined"
                        prepend-icon="mdi-palette"
                        @update:model-value="generateSmartColors"
                      />
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Swatches Preview -->
          <v-row v-if="showSwatchesPreview">
            <v-col cols="12">
              <v-card
                variant="outlined"
                class="pa-4"
              >
                <v-card-title class="text-h6">
                  <v-icon class="mr-2">
                    mdi-palette-swatch
                  </v-icon>
                  Generated Color Palette
                </v-card-title>
                <v-card-text>
                  <v-row>
                    <v-col
                      v-for="(swatch, index) in colorSwatches"
                      :key="index"
                      cols="12"
                      sm="6"
                      md="2"
                    >
                      <v-card
                        class="swatch-card"
                        :color="swatch.color"
                        height="120"
                      >
                        <v-card-text class="text-center pa-2">
                          <div class="text-h6 mb-2">
                            {{ swatch.emoji }}
                          </div>
                          <div
                            class="text-caption font-weight-bold"
                            :class="swatch.textColor === '#FFFFFF' ? 'text-white' : 'text-black'"
                          >
                            {{ swatch.name }}
                          </div>
                          <div
                            class="text-caption"
                            :class="swatch.textColor === '#FFFFFF' ? 'text-white' : 'text-black'"
                          >
                            {{ swatch.color }}
                          </div>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <!-- Advanced Color Design Mode -->
      <v-card-text v-if="designMode === 'advanced'">
        <v-form @submit.prevent="saveSettings">
          <!-- Color Settings -->
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-color-picker
                  v-model="primaryColor"
                  mode="hex"
                  hide-inputs
                  class="mb-4"
                />
                <v-text-field
                  v-model="primaryColor"
                  label="Primary Color (main buttons, highlights)"
                  variant="outlined"
                  prepend-icon="mdi-palette"
                  @update:model-value="updatePrimaryColor"
                />
              </v-card>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-color-picker
                  v-model="secondaryColor"
                  mode="hex"
                  hide-inputs
                  class="mb-4"
                />
                <v-text-field
                  v-model="secondaryColor"
                  label="Text Color (for readability)"
                  variant="outlined"
                  prepend-icon="mdi-format-color-text"
                  @update:model-value="updateSecondaryColor"
                />
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-color-picker
                  v-model="tertiaryColor"
                  mode="hex"
                  hide-inputs
                  class="mb-4"
                />
                <v-text-field
                  v-model="tertiaryColor"
                  label="Background Color (main content area)"
                  variant="outlined"
                  prepend-icon="mdi-format-paint"
                  @update:model-value="updateTertiaryColor"
                />
              </v-card>
            </v-col>

            <v-col
              cols="12"
              md="6"
            >
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-color-picker
                  v-model="quaternaryColor"
                  mode="hex"
                  hide-inputs
                  class="mb-4"
                />
                <v-text-field
                  v-model="quaternaryColor"
                  label="Accent Color (secondary buttons, chips)"
                  variant="outlined"
                  prepend-icon="mdi-star"
                  @update:model-value="updateQuaternaryColor"
                />
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-color-picker
                  v-model="pageBackgroundColor"
                  mode="hex"
                  hide-inputs
                  class="mb-4"
                />
                <v-text-field
                  v-model="pageBackgroundColor"
                  label="Page Background Color (app body)"
                  variant="outlined"
                  prepend-icon="mdi-desktop-classic"
                  @update:model-value="updatePageBackgroundColor"
                />
              </v-card>
            </v-col>
          </v-row>

          <!-- Accessibility Validation -->
          <v-row v-if="accessibilityValidation.hasIssues">
            <v-col cols="12">
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-alert
                  type="warning"
                  variant="tonal"
                  class="mb-4"
                >
                  <template #title>
                    <v-icon class="mr-2">
                      mdi-accessibility
                    </v-icon>
                    Accessibility Warning
                  </template>
                  <template #text>
                    <div class="text-body-2">
                      <p class="mb-2">
                        Some color combinations may not meet accessibility standards:
                      </p>
                      <ul class="mb-2">
                        <li
                          v-for="issue in accessibilityValidation.issues"
                          :key="issue"
                          class="text-caption"
                        >
                          {{ issue }}
                        </li>
                      </ul>
                      <p class="text-caption">
                        <strong>Recommendation:</strong> Adjust colors to ensure sufficient contrast for users with visual impairments.
                      </p>
                    </div>
                  </template>
                </v-alert>
              </v-card>
            </v-col>
          </v-row>

          <v-row v-else-if="primaryColor && secondaryColor && tertiaryColor && quaternaryColor">
            <v-col cols="12">
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-alert
                  type="success"
                  variant="tonal"
                  class="mb-4"
                >
                  <template #title>
                    <v-icon class="mr-2">
                      mdi-check-circle
                    </v-icon>
                    Accessibility Compliant
                  </template>
                  <template #text>
                    <div class="text-body-2">
                      <p class="mb-0">
                        All color combinations meet WCAG AA accessibility standards for sufficient contrast.
                      </p>
                    </div>
                  </template>
                </v-alert>
              </v-card>
            </v-col>
          </v-row>

          <!-- School Name -->
          <v-row>
            <v-col cols="12">
              <v-card
                :color="tertiaryColor"
                class="pa-4 mb-4"
              >
                <v-text-field
                  v-model="schoolName"
                  label="School Name"
                  variant="outlined"
                  prepend-icon="mdi-school"
                  placeholder="Enter your school name"
                  :rules="[rules.required]"
                />
              </v-card>
            </v-col>
          </v-row>

          <!-- Logo Upload -->
          <v-row>
            <v-col cols="12">
              <v-card
                :color="tertiaryColor"
                class="pa-4"
              >
                <v-card-title
                  class="text-h6"
                  :style="{ color: designMode === 'advanced' ? secondaryColor : undefined }"
                >
                  <v-icon class="mr-2">
                    mdi-image
                  </v-icon>
                  School Logo
                </v-card-title>

                <v-card-text>
                  <v-file-input
                    v-model="logoFile"
                    accept=".png,.jpg,.jpeg,.svg"
                    label="Upload Logo (PNG, JPG, SVG)"
                    variant="outlined"
                    prepend-icon="mdi-camera"
                    :rules="[rules.imageSize, rules.imageType]"
                    @change="handleLogoUpload"
                  />

                  <!-- Logo Preview -->
                  <div
                    v-if="logoPreview"
                    class="mt-4"
                  >
                    <v-card
                      :color="tertiaryColor"
                      class="pa-4 text-center"
                    >
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
              <v-card
                :color="tertiaryColor"
                class="pa-4"
              >
                <v-card-title
                  class="text-h6"
                  :style="{ color: designMode === 'advanced' ? secondaryColor : undefined }"
                >
                  <v-icon class="mr-2">
                    mdi-eye
                  </v-icon>
                  Application Preview
                </v-card-title>

                <v-card-text>
                  <v-card
                    class="preview-container"
                    :color="designMode === 'advanced' ? pageBackgroundColor : tertiaryColor"
                    max-height="800"
                  >
                    <!-- App Bar Preview -->
                    <v-app-bar
                      :color="primaryColor"
                      dark
                    >
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
                          <v-icon
                            size="small"
                            class="mr-2"
                          >
                            mdi-account-group
                          </v-icon>
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
                          <span
                            class="text-h6 font-weight-bold"
                            :class="adaptivePrimaryLargeTextColor === '#FFFFFF' ? 'text-white' : 'text-black'"
                          >{{ schoolName }}</span>
                          <span
                            class="text-caption"
                            :class="adaptivePrimaryTextColor === '#FFFFFF' ? 'text-white' : 'text-black'"
                          >ScholarTrack</span>
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
                          <v-icon
                            size="small"
                            class="mr-2"
                          >
                            mdi-account-group
                          </v-icon>
                        </template>
                      </v-select>

                      <v-chip
                        :color="secondaryColor"
                        class="text-caption"
                      >
                        Standard
                      </v-chip>
                    </v-app-bar>

                    <!-- Main Content Preview -->
                    <v-container class="pa-6">
                      <!-- Header Card -->
                      <v-card
                        class="mb-3"
                        :color="designMode === 'advanced' ? tertiaryColor : undefined"
                      >
                        <v-card-title class="d-flex align-center">
                          <v-icon class="mr-2">
                            mdi-account-group
                          </v-icon>
                          <span
                            class="text-truncate"
                            :style="{ color: designMode === 'advanced' ? secondaryColor : undefined }"
                          >Math 101</span>
                          <v-spacer />
                          <v-chip
                            :color="primaryColor"
                            variant="outlined"
                          >
                            24 Students
                          </v-chip>
                        </v-card-title>

                        <v-card-text>
                          <!-- Student Grid Preview -->
                          <v-row>
                            <v-col
                              v-for="(student, index) in previewStudents"
                              :key="index"
                              cols="6"
                              sm="3"
                            >
                              <v-card
                                :color="student.color"
                                class="student-preview-card"
                                @click="() => {}"
                              >
                                <v-card-text class="text-center pa-2">
                                  <div
                                    class="text-body-2 font-weight-bold"
                                    :class="adaptiveTextColor === '#FFFFFF' ? 'text-white' : 'text-black'"
                                  >
                                    {{ student.name }}
                                  </div>
                                  <div class="text-h6 mb-1">
                                    {{ student.emoji }}
                                  </div>
                                  <div
                                    class="text-caption"
                                    :class="adaptiveTextColor === '#FFFFFF' ? 'text-white' : 'text-black'"
                                  >
                                    {{ student.status }}
                                  </div>
                                </v-card-text>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>

                      <!-- Data Table Preview -->
                      <v-card
                        class="mb-3"
                        :color="designMode === 'advanced' ? tertiaryColor : undefined"
                      >
                        <v-card-title class="d-flex align-center">
                          <v-icon class="mr-2">
                            mdi-account
                          </v-icon>
                          <span :style="{ color: designMode === 'advanced' ? secondaryColor : undefined }">Student Management</span>
                        </v-card-title>

                        <v-data-table
                          :headers="previewTableHeaders"
                          :items="previewTableItems"
                          :items-per-page="1"
                          hide-default-footer
                          class="elevation-1"
                        >
                          <template #item.emoji="{ item }">
                            <span class="text-h6">{{ item.emoji }}</span>
                          </template>

                          <template #item.classes="{ item }">
                            <v-chip
                              size="small"
                              :color="secondaryColor"
                            >
                              {{ item.classes }}
                            </v-chip>
                          </template>

                          <template #item.status="{ item }">
                            <v-chip
                              size="small"
                              color="success"
                            >
                              {{ item.status }}
                            </v-chip>
                          </template>

                          <template #item.actions>
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
                      <v-card
                        class="mb-4"
                        :color="designMode === 'advanced' ? tertiaryColor : undefined"
                      >
                        <v-card-title class="d-flex align-center">
                          <v-icon class="mr-2">
                            mdi-plus
                          </v-icon>
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
                      <v-dialog
                        v-model="showPreviewDialog"
                        max-width="400"
                        persistent
                      >
                        <v-card :color="quaternaryColor">
                          <v-card-title class="d-flex align-center">
                            <v-icon class="mr-2">
                              mdi-account
                            </v-icon>
                            <span :class="adaptiveTextColor === '#FFFFFF' ? 'text-white' : 'text-black'">Edit Student</span>
                            <v-spacer />
                            <v-btn
                              icon
                              @click="showPreviewDialog = false"
                            >
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
                            <v-btn
                              :color="primaryColor"
                              variant="elevated"
                            >
                              Save Changes
                            </v-btn>
                          </v-card-actions>
                        </v-card>
                      </v-dialog>

                      <!-- Quick Actions -->
                      <v-card :color="designMode === 'advanced' ? tertiaryColor : undefined">
                        <v-card-title class="text-subtitle-1">
                          <v-icon class="mr-2">
                            mdi-lightning-bolt
                          </v-icon>
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
          v-if="designMode === 'smart'"
          :color="primaryColor"
          variant="outlined"
          class="mr-2"
          @click="toggleSwatchesPreview"
        >
          <v-icon class="mr-2">
            mdi-palette-swatch
          </v-icon>
          {{ showSwatchesPreview ? 'Hide' : 'Show' }} Swatches Preview
        </v-btn>
        <v-btn
          :color="designMode === 'advanced' ? primaryColor : 'primary'"
          variant="elevated"
          :loading="saving"
          :disabled="!isValid"
          @click="saveSettings"
        >
          <v-icon class="mr-2">
            mdi-content-save
          </v-icon>
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
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useAppStore } from '../../stores/appStore';
import { componentLogger } from '../../services/logger';
import { useTheme } from 'vuetify';
import {
  getAccessibleTextColor,
  getAccessibleLargeTextColor,
  validateColorContrast,
} from '../../utils/colorUtils';

const store = useAppStore();
const theme = useTheme();

// Form data - Design-focused color hierarchy
const designMode = ref<'smart' | 'advanced'>('smart');
const colorScheme = ref<'monochromatic' | 'adjacent' | 'triadic' | 'tetrad'>('monochromatic');
const baseColor = ref('#1976D2'); // Base color for smart mode

const primaryColor = ref('#1976D2'); // Blue for primary actions
const secondaryColor = ref('#212121'); // Dark gray for text (readable)
const tertiaryColor = ref('#FFFFFF'); // White background (clean)
const quaternaryColor = ref('#FF9800'); // Orange accent (complementary)
const pageBackgroundColor = ref('#F5F5F5'); // Light gray for page background
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
const showSwatchesPreview = ref(false);

// Validation rules
const rules = {
  required: (value: string): boolean | string => !!value || 'This field is required',
  imageSize: (value: File | null): boolean | string => {
    if (!value) return true;
    const maxSize = 2 * 1024 * 1024; // 2MB
    return value.size <= maxSize || 'Image must be less than 2MB';
  },
  imageType: (value: File | null): boolean | string => {
    if (!value) return true;
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/svg+xml'];
    const fileExtension = value.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'svg'];

    const isValidType = allowedTypes.includes(value.type) ??
                       (fileExtension && allowedExtensions.includes(fileExtension));

    return isValidType ?? 'Please upload a PNG, JPG, JPEG, WebP, or SVG file';
  },
};

// Form validation
const isValid = computed(() => {
  return primaryColor.value && secondaryColor.value;
});

// Adaptive colors for accessibility
const adaptiveTextColor = computed(() => getAccessibleTextColor(tertiaryColor.value));
const adaptivePrimaryTextColor = computed(() => getAccessibleTextColor(primaryColor.value));
const adaptivePrimaryLargeTextColor = computed(() => getAccessibleLargeTextColor(primaryColor.value));

// Color swatches for preview
const colorSwatches = computed(() => {
  // Ensure all colors have valid fallback values and are not undefined
  const primary = primaryColor.value?.trim() ? primaryColor.value : '#1976D2';
  const secondary = secondaryColor.value?.trim() ? secondaryColor.value : '#212121';
  const tertiary = tertiaryColor.value?.trim() ? tertiaryColor.value : '#FFFFFF';
  const quaternary = quaternaryColor.value?.trim() ? quaternaryColor.value : '#FF9800';
  const background = pageBackgroundColor.value?.trim() ? pageBackgroundColor.value : '#F5F5F5';

  const swatches = [
    {
      name: 'Primary',
      color: primary,
      emoji: '🎨',
      textColor: getAccessibleTextColor(primary),
    },
    {
      name: 'Secondary',
      color: secondary,
      emoji: '📝',
      textColor: getAccessibleTextColor(secondary),
    },
    {
      name: 'Tertiary',
      color: tertiary,
      emoji: '🖼️',
      textColor: getAccessibleTextColor(tertiary),
    },
    {
      name: 'Quaternary',
      color: quaternary,
      emoji: '⭐',
      textColor: getAccessibleTextColor(quaternary),
    },
    {
      name: 'Background',
      color: background,
      emoji: '🏠',
      textColor: getAccessibleTextColor(background),
    },
  ];

  return swatches;
});

// Accessibility validation - Logical color hierarchy
const accessibilityValidation = computed(() => {
  // Primary semantic relationships (what actually matters for UI)
  const validations = {
    // Text on backgrounds (most critical for readability)
    textOnBackground: validateColorContrast(secondaryColor.value, tertiaryColor.value),
    // Primary elements on background (buttons, highlights)
    primaryOnBackground: validateColorContrast(primaryColor.value, tertiaryColor.value),
    // Accent elements on background (secondary buttons, chips)
    accentOnBackground: validateColorContrast(quaternaryColor.value, tertiaryColor.value),
    // Text on primary elements (button text)
    textOnPrimary: validateColorContrast(secondaryColor.value, primaryColor.value),
    // Text on accent elements (accent button text)
    textOnAccent: validateColorContrast(secondaryColor.value, quaternaryColor.value),
  };

  const issues: string[] = [];

  if (!validations.textOnBackground.isValid) {
    issues.push('Text Color on Background - This affects all text readability');
  }
  if (!validations.primaryOnBackground.isValid) {
    issues.push('Primary Elements on Background - This affects buttons and highlights');
  }
  if (!validations.accentOnBackground.isValid) {
    issues.push('Accent Elements on Background - This affects secondary buttons and chips');
  }
  if (!validations.textOnPrimary.isValid) {
    issues.push('Text on Primary Elements - This affects button text readability');
  }
  if (!validations.textOnAccent.isValid) {
    issues.push('Text on Accent Elements - This affects accent button text readability');
  }

  const hasIssues = issues.length > 0;

  return {
    validations,
    issues,
    hasIssues,
    overallValid: !hasIssues,
  };
});

// Watch for design mode changes to update all colors
watch(designMode, (newMode) => {
  if (newMode === 'advanced') {
    // When switching to advanced mode, apply all colors to the theme
    if (theme.themes.value?.['light']) {
      theme.themes.value['light'].colors.background = pageBackgroundColor.value;
      theme.themes.value['light'].colors.primary = primaryColor.value;
      theme.themes.value['light'].colors.secondary = secondaryColor.value;
      theme.themes.value['light'].colors.surface = tertiaryColor.value;
      theme.themes.value['light'].colors['accent'] = quaternaryColor.value;
    }
  } else if (newMode === 'smart') {
    // When switching to smart mode, regenerate colors
    generateSmartColors();
  }
});

// Watch for color scheme and base color changes in smart mode
watch([colorScheme, baseColor], () => {
  if (designMode.value === 'smart') {
    generateSmartColors();
  }
});

// Load existing settings
onMounted(() => {
  const settings = store.getStyleSettings();
  if (settings) {
    designMode.value = settings.designMode ?? 'smart';
    colorScheme.value = settings.colorScheme ?? 'monochromatic';
    baseColor.value = settings.baseColor ?? '#1976D2';

    if (designMode.value === 'smart') {
      generateSmartColors();
    } else {
      primaryColor.value = settings.primaryColor;
      secondaryColor.value = settings.secondaryColor;
      tertiaryColor.value = settings.tertiaryColor ?? '#FFFFFF';
      quaternaryColor.value = settings.quaternaryColor ?? '#FF9800';
      pageBackgroundColor.value = settings.pageBackgroundColor ?? '#F5F5F5';
    }

    schoolName.value = settings.schoolName ?? 'ScholarTrack';
    if (settings.logoImage) {
      logoPreview.value = settings.logoImage;
    }
  } else {
    // Generate initial smart colors
    generateSmartColors();
  }
});

// Update colors with real-time theme updates
const updatePrimaryColor = (color: string): void => {
  primaryColor.value = color;

  // Real-time updates for primary color in Advanced Mode
  if (designMode.value === 'advanced') {
    if (theme.themes.value?.['light']) {
      theme.themes.value['light'].colors.primary = color;
    }
  }
};

const updateSecondaryColor = (color: string): void => {
  secondaryColor.value = color;

  // Real-time updates for secondary color in Advanced Mode
  if (designMode.value === 'advanced') {
    if (theme.themes.value?.['light']) {
      theme.themes.value['light'].colors.secondary = color;
    }
  }
};

const updateTertiaryColor = (color: string): void => {
  tertiaryColor.value = color;

  // Real-time updates for tertiary color in Advanced Mode
  if (designMode.value === 'advanced') {
    if (theme.themes.value?.['light']) {
      theme.themes.value['light'].colors.surface = color;
    }
  }
};

const updateQuaternaryColor = (color: string): void => {
  quaternaryColor.value = color;

  // Real-time updates for quaternary color in Advanced Mode
  if (designMode.value === 'advanced') {
    if (theme.themes.value?.['light']) {
      theme.themes.value['light'].colors['accent'] = color;
    }
  }
};

const updatePageBackgroundColor = (color: string): void => {
  pageBackgroundColor.value = color;

  // Real-time updates for page background color in Advanced Mode
  if (designMode.value === 'advanced') {
    // 1) Update Vuetify theme for Style Settings page background
    if (theme.themes.value?.['light']) {
      theme.themes.value['light'].colors.background = color;
    }

    // 2) Preview section automatically updates via reactive variables
    // (pageBackgroundColor.value is used in the preview template)

    // 3) Force reactivity by triggering a small delay update
    void nextTick(() => {
      // This ensures the template updates are applied immediately
      pageBackgroundColor.value = color;
    });
  }
};

// Smart color generation functions
const generateSmartColors = (): void => {
  const colors = generateColorPalette(baseColor.value, colorScheme.value);
  primaryColor.value = colors.primary;
  secondaryColor.value = colors.secondary;
  tertiaryColor.value = colors.tertiary;
  quaternaryColor.value = colors.quaternary;
  pageBackgroundColor.value = colors.pageBackground;

  // If in advanced mode, update all theme colors immediately
  if (designMode.value === 'advanced') {
    if (theme.themes.value?.['light']) {
      theme.themes.value['light'].colors.background = pageBackgroundColor.value;
      theme.themes.value['light'].colors.primary = primaryColor.value;
      theme.themes.value['light'].colors.secondary = secondaryColor.value;
      theme.themes.value['light'].colors.surface = tertiaryColor.value;
      theme.themes.value['light'].colors['accent'] = quaternaryColor.value;
    }
  }
};

const generateColorPalette = (baseColor: string, scheme: string): {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  pageBackground: string;
} => {
  const hsl = hexToHsl(baseColor);

  switch (scheme) {
  case 'monochromatic':
    return generateMonochromaticPalette(hsl);
  case 'adjacent':
    return generateAdjacentPalette(hsl);
  case 'triadic':
    return generateTriadicPalette(hsl);
  case 'tetrad':
    return generateTetradPalette(hsl);
  default:
    return generateMonochromaticPalette(hsl);
  }
};

const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { h: 0, s: 0, l: 50 };

  const r = parseInt(result[1] ?? '0', 16) / 255;
  const g = parseInt(result[2] ?? '0', 16) / 255;
  const b = parseInt(result[3] ?? '0', 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
    case g: h = (b - r) / d + 2; break;
    case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
  h = h / 360;
  s = s / 100;
  l = l / 100;

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  const toHex = (c: number): string => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const generateMonochromaticPalette = (baseHsl: { h: number; s: number; l: number }): {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  pageBackground: string;
} => {
  // Ensure HSL values are within valid ranges
  const h = Math.max(0, Math.min(360, baseHsl.h ?? 0));
  const s = Math.max(0, Math.min(100, baseHsl.s ?? 50));
  const l = Math.max(0, Math.min(100, baseHsl.l ?? 50));

  // Generate colors with proper background-to-foreground relationships
  const palette = {
    // Primary: Button background (medium brightness)
    primary: hslToHex(h, Math.max(s, 40), Math.max(Math.min(l, 60), 40)),
    // Secondary: Text color (dark for good contrast on light backgrounds)
    secondary: hslToHex(h, Math.max(s * 0.6, 20), Math.max(Math.min(l * 0.4, 30), 15)),
    // Tertiary: Main content background (very light)
    tertiary: hslToHex(h, Math.min(s * 0.1, 10), Math.min(l * 1.4, 98)),
    // Quaternary: Accent button background (medium-high brightness)
    quaternary: hslToHex(h, Math.max(s * 0.8, 30), Math.max(Math.min(l * 0.8, 65), 45)),
    // Page Background: App background (extremely light)
    pageBackground: hslToHex(h, Math.min(s * 0.05, 5), Math.min(l * 1.6, 99)),
  };

  return palette;
};

const generateAdjacentPalette = (baseHsl: { h: number; s: number; l: number }): {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  pageBackground: string;
} => {
  const adjacentHue = (baseHsl.h + 30) % 360;

  // Generate colors with proper background-to-foreground relationships
  const palette = {
    // Primary: Button background (medium brightness)
    primary: hslToHex(baseHsl.h, Math.max(baseHsl.s, 40), Math.max(Math.min(baseHsl.l, 60), 40)),
    // Secondary: Text color (dark for good contrast on light backgrounds)
    secondary: hslToHex(adjacentHue, Math.max(baseHsl.s * 0.6, 20), Math.max(Math.min(baseHsl.l * 0.4, 30), 15)),
    // Tertiary: Main content background (very light)
    tertiary: hslToHex(baseHsl.h, Math.min(baseHsl.s * 0.1, 10), Math.min(baseHsl.l * 1.4, 98)),
    // Quaternary: Accent button background (medium-high brightness)
    quaternary: hslToHex(adjacentHue, Math.max(baseHsl.s * 0.8, 30), Math.max(Math.min(baseHsl.l * 0.8, 65), 45)),
    // Page Background: App background (extremely light)
    pageBackground: hslToHex(baseHsl.h, Math.min(baseHsl.s * 0.05, 5), Math.min(baseHsl.l * 1.6, 99)),
  };

  return palette;
};

const generateTriadicPalette = (baseHsl: { h: number; s: number; l: number }): {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  pageBackground: string;
} => {
  const triadic1 = (baseHsl.h + 120) % 360;
  const triadic2 = (baseHsl.h + 240) % 360;

  // Generate colors with proper background-to-foreground relationships
  const palette = {
    // Primary: Button background (medium brightness)
    primary: hslToHex(baseHsl.h, Math.max(baseHsl.s, 40), Math.max(Math.min(baseHsl.l, 60), 40)),
    // Secondary: Text color (dark for good contrast on light backgrounds)
    secondary: hslToHex(triadic1, Math.max(baseHsl.s * 0.6, 20), Math.max(Math.min(baseHsl.l * 0.4, 30), 15)),
    // Tertiary: Main content background (very light)
    tertiary: hslToHex(baseHsl.h, Math.min(baseHsl.s * 0.1, 10), Math.min(baseHsl.l * 1.4, 98)),
    // Quaternary: Accent button background (medium-high brightness)
    quaternary: hslToHex(triadic2, Math.max(baseHsl.s * 0.8, 30), Math.max(Math.min(baseHsl.l * 0.8, 65), 45)),
    // Page Background: App background (extremely light)
    pageBackground: hslToHex(baseHsl.h, Math.min(baseHsl.s * 0.05, 5), Math.min(baseHsl.l * 1.6, 99)),
  };

  return palette;
};

const generateTetradPalette = (baseHsl: { h: number; s: number; l: number }): {
  primary: string;
  secondary: string;
  tertiary: string;
  quaternary: string;
  pageBackground: string;
} => {
  const tetrad1 = (baseHsl.h + 90) % 360;
  const tetrad2 = (baseHsl.h + 180) % 360;

  // Generate colors with proper background-to-foreground relationships
  const palette = {
    // Primary: Button background (medium brightness)
    primary: hslToHex(baseHsl.h, Math.max(baseHsl.s, 40), Math.max(Math.min(baseHsl.l, 60), 40)),
    // Secondary: Text color (dark for good contrast on light backgrounds)
    secondary: hslToHex(tetrad1, Math.max(baseHsl.s * 0.6, 20), Math.max(Math.min(baseHsl.l * 0.4, 30), 15)),
    // Tertiary: Main content background (very light)
    tertiary: hslToHex(baseHsl.h, Math.min(baseHsl.s * 0.1, 10), Math.min(baseHsl.l * 1.4, 98)),
    // Quaternary: Accent button background (medium-high brightness)
    quaternary: hslToHex(tetrad2, Math.max(baseHsl.s * 0.8, 30), Math.max(Math.min(baseHsl.l * 0.8, 65), 45)),
    // Page Background: App background (extremely light)
    pageBackground: hslToHex(baseHsl.h, Math.min(baseHsl.s * 0.05, 5), Math.min(baseHsl.l * 1.6, 99)),
  };

  return palette;
};

// Handle logo upload
const handleLogoUpload = (event: Event | File | null): void => {
  // Handle different event types
  let file: File | null = null;

  if (event instanceof File) {
    file = event;
  } else if (event && 'target' in event && event.target) {
    const target = event.target as HTMLInputElement;
    file = target.files?.[0] ?? null;
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

      img.onload = (): void => {
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
  void compressImage(file).then((compressedDataUrl) => {
    logoPreview.value = compressedDataUrl;
  });
};

// Remove logo
const removeLogo = (): void => {
  logoFile.value = null;
  logoPreview.value = '';
};

// Toggle swatches preview
const toggleSwatchesPreview = (): void => {
  showSwatchesPreview.value = !showSwatchesPreview.value;
};

// Save settings
const saveSettings = async (): Promise<void> => {
  if (!isValid.value) return;

  saving.value = true;

  try {
    await store.updateStyleSettings({
      designMode: designMode.value,
      colorScheme: colorScheme.value,
      baseColor: baseColor.value,
      primaryColor: primaryColor.value,
      secondaryColor: secondaryColor.value,
      tertiaryColor: tertiaryColor.value,
      quaternaryColor: quaternaryColor.value,
      pageBackgroundColor: pageBackgroundColor.value,
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

