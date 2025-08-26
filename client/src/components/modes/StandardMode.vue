<template>
  <div class="standard-mode">
    <!-- Responsive Header Card -->
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            <span class="text-truncate">{{ currentClass?.name || 'No Class Selected' }}</span>
            <v-spacer />
            <v-chip 
              color="primary" 
              variant="outlined"
              :size="xs ? 'small' : 'default'"
            >
              {{ currentClassStudents.length }} Students
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <div v-if="currentClassStudents.length === 0" class="text-center py-8">
              <v-icon 
                :size="xs ? '48' : '64'" 
                color="grey"
              >
                mdi-account-group-outline
              </v-icon>
              <p class="text-h6 text-grey mt-4">No students in this class</p>
              <p class="text-body-2 text-grey">Add students using the MANAGE STUDENTS mode</p>
            </div>
            
            <!-- Responsive Student Grid -->
            <div v-else class="student-grid" :class="gridClass">
              <div
                v-for="student in currentClassStudents"
                :key="student.id"
                class="student-square"
                :class="studentSquareClass"
                :style="{ backgroundColor: getStudentSquareColor(student.label) }"
                @click="openStudentModal(student)"
              >
                <div class="student-content">
                  <div class="student-label">{{ student.label }}</div>
                  <div class="student-emoji">{{ student.emoji }}</div>
                  <div class="student-status">{{ getStudentStatus(student.label) }}</div>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Responsive Quick Actions (Desktop Only) -->
    <v-row v-if="md" class="mt-4">
      <v-col>
        <v-card variant="outlined">
          <v-card-title class="text-subtitle-1">
            <v-icon class="mr-2">mdi-lightning-bolt</v-icon>
            Quick Actions
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="auto">
                <v-btn
                  color="primary"
                  variant="outlined"
                  prepend-icon="mdi-account-plus"
                  @click="quickAddStudent"
                >
                  Add Student
                </v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-chart-line"
                  @click="quickViewReports"
                >
                  View Reports
                </v-btn>
              </v-col>

            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Mobile Floating Action Button -->
    <v-fab-transition>
      <v-btn
        v-if="mobile"
        color="primary"
        icon="mdi-plus"
        size="large"
        class="floating-action-btn"
        @click="showMobileActions = !showMobileActions"
      />
    </v-fab-transition>

    <!-- Mobile Actions Menu -->
    <v-fab-transition>
      <div v-if="showMobileActions && mobile" class="mobile-actions">
        <v-btn
          color="primary"
          icon="mdi-account-plus"
          size="small"
          class="mb-2"
          @click="quickAddStudent"
        />
        <v-btn
          color="secondary"
          icon="mdi-chart-line"
          size="small"
          class="mb-2"
          @click="quickViewReports"
        />
      </div>
    </v-fab-transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { useAppStore } from '../../stores/appStore'
import type { StudentStatus } from '../../types'

const store = useAppStore()
const { xs, sm, md, lg, mobile } = useDisplay()

// Local state
const showMobileActions = ref(false)

const currentClass = computed(() => store.currentClass)
const currentClassStudents = computed(() => store.currentClassStudents)

// Responsive grid classes
const gridClass = computed(() => ({
  'student-grid-xs': xs.value,
  'student-grid-sm': sm.value,
  'student-grid-md': md.value,
  'student-grid-lg': lg.value
}))

// Responsive student square classes
const studentSquareClass = computed(() => ({
  'student-square-xs': xs.value,
  'student-square-sm': sm.value,
  'student-square-md': md.value,
  'student-square-lg': lg.value
}))

const getStudentStatus = (studentLabel: string): StudentStatus => {
  return store.getStudentStatus(studentLabel)
}

const getStudentSquareColor = (studentLabel: string): string => {
  const status = getStudentStatus(studentLabel)
  return store.statusColors[status]
}

const openStudentModal = (student: any) => {
  store.openStudentModal(student)
}

// Quick actions
const quickAddStudent = () => {
  store.switchMode('MANAGE STUDENTS')
  showMobileActions.value = false
}

const quickViewReports = () => {
  store.switchMode('REPORTS')
  showMobileActions.value = false
}


</script>

<style scoped>
/* Responsive Grid Layouts */
.student-grid {
  display: grid;
  gap: 16px;
  padding: 16px;
}

.student-grid-xs {
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 12px;
}

.student-grid-sm {
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  padding: 14px;
}

.student-grid-md {
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  padding: 16px;
}

.student-grid-lg {
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 20px;
  padding: 20px;
}

/* Responsive Student Squares */
.student-square {
  aspect-ratio: 1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.student-square:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.student-square-xs {
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.student-square-sm {
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.student-square-md {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.student-square-lg {
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1);
}

.student-content {
  text-align: center;
  color: white;
  font-weight: 500;
  padding: 8px;
}

.student-label {
  font-weight: 600;
  margin-bottom: 4px;
}

.student-emoji {
  margin-bottom: 4px;
}

.student-status {
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Responsive text sizes */
.student-square-xs .student-label {
  font-size: 0.9rem;
}

.student-square-xs .student-emoji {
  font-size: 1.2rem;
}

.student-square-xs .student-status {
  font-size: 0.65rem;
}

.student-square-sm .student-label {
  font-size: 1rem;
}

.student-square-sm .student-emoji {
  font-size: 1.3rem;
}

.student-square-sm .student-status {
  font-size: 0.7rem;
}

.student-square-md .student-label {
  font-size: 1.1rem;
}

.student-square-md .student-emoji {
  font-size: 1.5rem;
}

.student-square-md .student-status {
  font-size: 0.75rem;
}

.student-square-lg .student-label {
  font-size: 1.2rem;
}

.student-square-lg .student-emoji {
  font-size: 1.8rem;
}

.student-square-lg .student-status {
  font-size: 0.8rem;
}

/* Mobile Floating Action Button */
.floating-action-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

/* Mobile Actions Menu */
.mobile-actions {
  position: fixed;
  bottom: 80px;
  right: 24px;
  z-index: 999;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Responsive container adjustments */
@media (max-width: 600px) {
  .floating-action-btn {
    bottom: 16px;
    right: 16px;
  }
  
  .mobile-actions {
    bottom: 72px;
    right: 16px;
  }
}
</style>
