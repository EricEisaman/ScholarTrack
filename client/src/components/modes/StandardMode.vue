<template>
  <div class="standard-mode">
    <!-- Responsive Header Card -->
    <v-row>
      <v-col>
        <v-card :color="cardBackgroundColor">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            <span class="text-truncate">{{ currentClass?.name ?? 'No Class Selected' }}</span>
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
                :color="accessibleTextColor === '#FFFFFF' ? 'white' : 'black'"
              >
                mdi-account-group-outline
              </v-icon>
              <p class="text-h6 mt-4" :class="accessibleTextColor === '#FFFFFF' ? 'text-white' : 'text-black'">No students in this class</p>
              <p class="text-body-2" :class="accessibleTextColor === '#FFFFFF' ? 'text-white' : 'text-black'">Add students using the MANAGE STUDENTS mode</p>
            </div>

            <!-- Responsive Student Grid -->
            <div v-else class="student-grid" :class="gridClass">
              <div
                v-for="student in currentClassStudents"
                :key="student.id"
                class="student-square"
                :class="[studentSquareClass, `bg-${getStudentSquareColorClass(student.code)}`]"
                @click="openStudentModal(student)"
              >
                <div class="student-content">
                  <div class="student-label">{{ student.label }}</div>
                  <div class="student-emoji">{{ student.emoji }}</div>
                  <div class="student-status">{{ getStudentStatus(student.code) }}</div>
                  <div v-if="getStudentMemo(student.code)" class="student-memo">{{ getStudentMemo(student.code) }}</div>
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
                  color="quaternary"
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
          color="quaternary"
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
import { computed, ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useAppStore } from '../../stores/appStore';
import { getAccessibleTextColor } from '../../utils/colorUtils';
import type { StudentStatus, Student } from '../../types';

const store = useAppStore();
const { xs, sm, md, lg, mobile } = useDisplay();

// Local state
const showMobileActions = ref(false);

const currentClass = computed(() => store.currentClass);
const currentClassStudents = computed(() => store.currentClassStudents);

// Responsive grid classes
const gridClass = computed(() => ({
  'student-grid-xs': xs.value,
  'student-grid-sm': sm.value,
  'student-grid-md': md.value,
  'student-grid-lg': lg.value,
}));

// Responsive student square classes
const studentSquareClass = computed(() => ({
  'student-square-xs': xs.value,
  'student-square-sm': sm.value,
  'student-square-md': md.value,
  'student-square-lg': lg.value,
}));

// Card background color from theme
const cardBackgroundColor = computed(() => {
  const settings = store.getStyleSettings();
  return settings?.tertiaryColor ?? '#000000';
});

// Accessible text color for the card background
const accessibleTextColor = computed(() => {
  return getAccessibleTextColor(cardBackgroundColor.value);
});

const getStudentStatus = (studentCode: string): StudentStatus => {
  return store.getStudentStatus(studentCode);
};

const getStudentMemo = (studentCode: string): string | null => {
  const studentTransactions = store.transactions
    .filter((t) => t.studentCode === studentCode && t.className === store.currentClass?.name)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return studentTransactions.length > 0 && studentTransactions[0]?.memo ? studentTransactions[0].memo : null;
};

// This function is kept for potential future use but not currently used
// const getStudentSquareColor = (studentCode: string): string => {
//   const status = getStudentStatus(studentCode);
//   return store.statusColors[status] || '#1976D2'; // Default color if status not found
// };

const getStudentSquareColorClass = (studentCode: string): string => {
  const status = getStudentStatus(studentCode);
  const color = store.statusColors[status] ?? '#1976D2';

  // Convert hex colors to CSS classes
  switch (color.toLowerCase()) {
  case '#4caf50': return 'green';
  case '#ff9800': return 'orange';
  case '#f44336': return 'red';
  case '#2196f3': return 'blue';
  case '#9c27b0': return 'purple';
  case '#ff5722': return 'deep-orange';
  case '#795548': return 'brown';
  case '#607d8b': return 'blue-grey';
  case '#e91e63': return 'pink';
  case '#00bcd4': return 'cyan';
  case '#8bc34a': return 'light-green';
  case '#ffc107': return 'amber';
  case '#673ab7': return 'deep-purple';
  case '#3f51b5': return 'indigo';
  case '#009688': return 'teal';
  case '#ffeb3b': return 'yellow';
  case '#1976d2':
  default: return 'primary';
  }
};

const openStudentModal = (student: Student) => {
  store.openStudentModal(student);
};

// Quick actions
const quickAddStudent = async () => {
  await store.switchMode('MANAGE STUDENTS');
  showMobileActions.value = false;
};

const quickViewReports = async () => {
  await store.switchMode('REPORTS');
  showMobileActions.value = false;
};

</script>

<style scoped>
/* Responsive Grid Layouts */
.student-grid {
  display: grid;
  gap: 16px;
  padding: 16px;
  background-color: transparent;
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

.student-memo {
  font-size: 0.7rem;
  opacity: 0.8;
  font-style: italic;
  margin-top: 2px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

/* Student Square Color Classes */
.bg-green {
  background-color: #4caf50 !important;
}

.bg-orange {
  background-color: #ff9800 !important;
}

.bg-red {
  background-color: #f44336 !important;
}

.bg-blue {
  background-color: #2196f3 !important;
}

.bg-purple {
  background-color: #9c27b0 !important;
}

.bg-deep-orange {
  background-color: #ff5722 !important;
}

.bg-brown {
  background-color: #795548 !important;
}

.bg-blue-grey {
  background-color: #607d8b !important;
}

.bg-pink {
  background-color: #e91e63 !important;
}

.bg-cyan {
  background-color: #00bcd4 !important;
}

.bg-light-green {
  background-color: #8bc34a !important;
}

.bg-amber {
  background-color: #ffc107 !important;
}

.bg-deep-purple {
  background-color: #673ab7 !important;
}

.bg-indigo {
  background-color: #3f51b5 !important;
}

.bg-teal {
  background-color: #009688 !important;
}

.bg-yellow {
  background-color: #ffeb3b !important;
}

.bg-primary {
  background-color: #1976d2 !important;
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
