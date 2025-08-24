<template>
  <div class="standard-mode">
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-group</v-icon>
            {{ currentClass?.name || 'No Class Selected' }}
            <v-spacer />
            <v-chip color="primary" variant="outlined">
              {{ currentClassStudents.length }} Students
            </v-chip>
          </v-card-title>
          
          <v-card-text>
            <div v-if="currentClassStudents.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
              <p class="text-h6 text-grey mt-4">No students in this class</p>
              <p class="text-body-2 text-grey">Add students using the ADD STUDENT mode</p>
            </div>
            
            <div v-else class="student-grid">
              <div
                v-for="student in currentClassStudents"
                :key="student.id"
                class="student-square"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '../../stores/appStore'
import type { StudentStatus } from '../../types'

const store = useAppStore()

const currentClass = computed(() => store.currentClass)
const currentClassStudents = computed(() => store.currentClassStudents)

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
</script>

<style scoped>
.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  padding: 16px;
}

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

.student-content {
  text-align: center;
  color: white;
  font-weight: 500;
}

.student-label {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.student-emoji {
  font-size: 1.5rem;
  margin-bottom: 4px;
}

.student-status {
  font-size: 0.75rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
