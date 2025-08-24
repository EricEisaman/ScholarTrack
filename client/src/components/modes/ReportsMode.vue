<template>
  <div class="reports-mode">
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-line</v-icon>
            Generate Reports
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="generateReport">
              <!-- Report Type -->
              <v-select
                v-model="reportType"
                :items="reportTypes"
                label="Report Type"
                variant="outlined"
                required
                class="mb-4"
              />

              <!-- Date Range -->
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="startDate"
                    label="Start Date"
                    type="date"
                    variant="outlined"
                    required
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="endDate"
                    label="End Date"
                    type="date"
                    variant="outlined"
                    required
                    class="mb-4"
                  />
                </v-col>
              </v-row>

              <!-- Class Filter (optional) -->
              <v-select
                v-model="selectedClass"
                :items="availableClasses"
                label="Class (optional)"
                variant="outlined"
                clearable
                class="mb-4"
              />

              <v-btn
                color="primary"
                @click="generateReport"
                :disabled="!isFormValid"
                :loading="isGenerating"
                block
              >
                Generate Report
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-information</v-icon>
            Report Information
          </v-card-title>
          
          <v-card-text>
            <div v-if="reportType === 'student'">
              <h4 class="text-h6 mb-2">Student Transaction Report</h4>
              <p class="text-body-2">
                This report shows all student status changes and their timestamps for the selected period.
                It includes when students left and returned from various locations.
              </p>
            </div>
            
            <div v-else-if="reportType === 'teacher'">
              <h4 class="text-h6 mb-2">Teacher Event Report</h4>
              <p class="text-body-2">
                This report shows all teacher-recorded events and incidents for the selected period.
                It includes behavioral incidents and rule violations.
              </p>
            </div>
            
            <v-divider class="my-4" />
            
            <h4 class="text-h6 mb-2">Available Data</h4>
            <ul class="text-body-2">
              <li>Total Students: {{ students.length }}</li>
              <li>Total Classes: {{ classes.length }}</li>
              <li>Total Transactions: {{ transactions.length }}</li>
            </ul>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAppStore } from '../../stores/appStore'

const store = useAppStore()

// Local state
const reportType = ref<'student' | 'teacher'>('student')
const startDate = ref('')
const endDate = ref('')
const selectedClass = ref('')
const isGenerating = ref(false)

// Computed properties
const students = computed(() => store.students)
const classes = computed(() => store.classes)
const transactions = computed(() => store.transactions)

const reportTypes = [
  { title: 'Student Transactions', value: 'student' },
  { title: 'Teacher Events', value: 'teacher' }
]

const availableClasses = computed(() => 
  classes.value.map(c => ({ title: c.name, value: c.name }))
)

const isFormValid = computed(() => 
  reportType.value && startDate.value && endDate.value
)

// Methods
const generateReport = async () => {
  if (!isFormValid.value) return
  
  isGenerating.value = true
  
  try {
    // This would call the backend API to generate the report
    const reportData = {
      type: reportType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      className: selectedClass.value || undefined
    }
    
    console.log('Generating report:', reportData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // This would trigger the PDF download
    console.log('Report generated successfully')
    
  } catch (error) {
    console.error('Failed to generate report:', error)
  } finally {
    isGenerating.value = false
  }
}
</script>
