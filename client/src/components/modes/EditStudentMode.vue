<template>
  <div class="edit-student-mode">
    <v-row>
      <v-col>
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-account-edit</v-icon>
            Edit Students
          </v-card-title>
          
          <v-card-text>
            <div v-if="students.length === 0" class="text-center py-8">
              <v-icon size="64" color="grey">mdi-account-group-outline</v-icon>
              <p class="text-h6 text-grey mt-4">No students found</p>
              <p class="text-body-2 text-grey">Add students using the ADD STUDENT mode</p>
            </div>
            
            <div v-else>
              <v-data-table
                :headers="headers"
                :items="students"
                :search="search"
                class="elevation-1"
              >
                <template v-slot:top>
                  <v-text-field
                    v-model="search"
                    label="Search students"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    class="mx-4"
                  />
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    size="small"
                    color="primary"
                    variant="outlined"
                    @click="editStudent(item.raw)"
                  >
                    Edit
                  </v-btn>
                </template>
              </v-data-table>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/appStore'
import type { Student } from '../../types'

const store = useAppStore()

// Local state
const search = ref('')

// Computed properties
const students = computed(() => store.students)

const headers = [
  { title: 'Label', key: 'label', sortable: true },
  { title: 'Emoji', key: 'emoji', sortable: false },
  { title: 'Code', key: 'code', sortable: false },
  { title: 'Classes', key: 'classes', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false }
]

// Methods
const editStudent = (student: Student) => {
  // This would open an edit modal
  console.log('Edit student:', student)
}
</script>
