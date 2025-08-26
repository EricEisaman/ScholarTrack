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

              <v-select
                v-model="reportFormat"
                :items="reportFormats"
                label="Report Format"
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
import { ref, computed } from 'vue';
import { useAppStore } from '../../stores/appStore';

const store = useAppStore();

// Local state
const reportType = ref<'student' | 'teacher'>('student');
const reportFormat = ref<'pdf' | 'text' | 'jpg'>('pdf');
const startDate = ref('');
const endDate = ref('');
const selectedClass = ref('');
const isGenerating = ref(false);

// Computed properties
const students = computed(() => store.students);
const classes = computed(() => store.classes);
const transactions = computed(() => store.transactions);

const reportTypes = [
  { title: 'Student Transactions', value: 'student' },
  { title: 'Teacher Events', value: 'teacher' },
];

const reportFormats = [
  { title: 'PDF (Online)', value: 'pdf' },
  { title: 'Text (Offline)', value: 'text' },
  { title: 'Image (Offline)', value: 'jpg' },
];

const availableClasses = computed(() =>
  classes.value.map(c => ({ title: c.name, value: c.name })),
);

const isFormValid = computed(() =>
  reportType.value && startDate.value && endDate.value,
);

// Methods
const generateReport = async () => {
  if (!isFormValid.value) return;

  isGenerating.value = true;

  try {
    const reportData = {
      type: reportType.value,
      startDate: startDate.value,
      endDate: endDate.value,
      className: selectedClass.value || undefined,
      // Send all IndexedDB data to backend for report generation
      data: {
        students: students.value,
        classes: classes.value,
        transactions: transactions.value,
      },
    };

    console.log('Generating report:', reportData);

    if (reportFormat.value === 'jpg') {
      // Generate JPG report locally
      const imageBlob = await generateJpgReport(reportData);
      const filename = `report_${reportType.value}_${new Date().toISOString().split('T')[0]}.jpg`;

      const url = window.URL.createObjectURL(imageBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('JPG report generated and downloaded successfully');

    } else if (reportFormat.value === 'text') {
      // Generate text report locally
      const textReport = generateOfflineReport(reportData);
      const filename = `report_${reportType.value}_${new Date().toISOString().split('T')[0]}.txt`;

      const blob = new Blob([textReport], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Text report generated and downloaded successfully');

    } else {
      // Try to call the backend API for PDF
      try {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(reportData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
        const filename = filenameMatch?.[1] || `report_${reportType.value}_${new Date().toISOString().split('T')[0]}.pdf`;

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('PDF report generated and downloaded successfully');

      } catch (networkError) {
        console.log('Network error, falling back to text report:', networkError);

        // Fallback to text report
        const textReport = generateOfflineReport(reportData);
        const filename = `report_${reportType.value}_${new Date().toISOString().split('T')[0]}.txt`;

        const blob = new Blob([textReport], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Fallback text report generated and downloaded successfully');
      }
    }

  } catch (error) {
    console.error('Failed to generate report:', error);
  } finally {
    isGenerating.value = false;
  }
};

const generateOfflineReport = (reportData: {
  type: 'student' | 'teacher'
  startDate: string
  endDate: string
  className?: string | undefined
}): string => {
  const { type, startDate, endDate, className } = reportData;
  const start = new Date(startDate);
  const end = new Date(endDate);

  let report = 'SCHOLAR TRACK REPORT\n';
  report += `Generated: ${new Date().toLocaleString()}\n`;
  report += `Type: ${type === 'student' ? 'Student Transactions' : 'Teacher Events'}\n`;
  report += `Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}\n`;
  if (className) {
    report += `Class: ${className}\n`;
  }
  report += `\n${'='.repeat(50)}\n\n`;

  // Filter transactions by date range and class
  const filteredTransactions = transactions.value.filter(t => {
    const transactionDate = new Date(t.timestamp);
    const inDateRange = transactionDate >= start && transactionDate <= end;
    const inClass = !className || t.className === className;
    return inDateRange && inClass;
  });

  if (type === 'student') {
    report += 'STUDENT TRANSACTIONS:\n\n';

    // Group by student
    const studentMap = new Map();
    filteredTransactions.forEach(t => {
      if (!studentMap.has(t.studentLabel)) {
        studentMap.set(t.studentLabel, []);
      }
      studentMap.get(t.studentLabel).push(t);
    });

    studentMap.forEach((studentTransactions, studentLabel) => {
      report += `Student: ${studentLabel}\n`;
      report += `${'-'.repeat(20)}\n`;

      studentTransactions
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .forEach((t: any) => {
          const time = new Date(t.timestamp).toLocaleString();
          const studentIdentifier = t.studentIdentifier || t.studentLabel;
          report += `${time}: ${studentIdentifier} - ${t.status}\n`;
        });

      report += '\n';
    });

  } else {
    report += 'TEACHER EVENTS:\n\n';

    // Filter for transactions that have eventType (teacher events)
    const teacherEvents = filteredTransactions.filter(t => t.eventType);

    teacherEvents.forEach(t => {
      const time = new Date(t.timestamp).toLocaleString();
      const studentIdentifier = t.studentIdentifier || t.studentLabel;
      report += `${time} - ${studentIdentifier}: ${t.eventType}\n`;
    });
  }

  report += `\n${'='.repeat(50)}\n`;
  report += `Total Records: ${filteredTransactions.length}\n`;
  report += 'Report generated offline from local data.\n';

  return report;
};

const generateJpgReport = async (reportData: {
  type: 'student' | 'teacher'
  startDate: string
  endDate: string
  className?: string | undefined
  data: {
    students: any[]
    classes: any[]
    transactions: any[]
  }
}): Promise<Blob> => {
  const { type, startDate, endDate, className, data } = reportData;
  const { transactions } = data;

  // Create off-screen canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // Set canvas size (A4 ratio)
  canvas.width = 2480; // 8.5 inches at 300 DPI
  canvas.height = 3508; // 11 inches at 300 DPI

  // Set background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set font styles
  const titleFont = 'bold 72px Arial, sans-serif';
  const subtitleFont = 'bold 48px Arial, sans-serif';
  const headerFont = 'bold 36px Arial, sans-serif';
  const bodyFont = '24px Arial, sans-serif';
  const smallFont = '18px Arial, sans-serif';

  let y = 120; // Starting Y position

  // Add logo if available
  const settings = store.getStyleSettings();
  if (settings?.logoImage) {
    try {
      const logoImg = new Image();
      logoImg.onload = () => {
        // Draw logo in top-left corner
        ctx.drawImage(logoImg, 100, 50, 80, 80);
      };
      logoImg.src = settings.logoImage;
      y += 100; // Extra space for logo
    } catch (error) {
      console.error('Error loading logo for image report:', error);
    }
  }

  // Title
  ctx.fillStyle = '#1976D2';
  ctx.font = titleFont;
  ctx.textAlign = 'center';
  ctx.fillText('ScholarTrack Report', canvas.width / 2, y);
  y += 100;

  // Subtitle
  ctx.fillStyle = '#424242';
  ctx.font = subtitleFont;
  ctx.fillText(`${type === 'student' ? 'Student Transactions' : 'Teacher Events'}`, canvas.width / 2, y);
  y += 80;

  // Report info
  ctx.font = bodyFont;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#666666';
  ctx.fillText(`Generated: ${new Date().toLocaleString()}`, 100, y);
  y += 40;
  ctx.fillText(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 100, y);
  y += 40;
  if (className) {
    ctx.fillText(`Class: ${className}`, 100, y);
    y += 40;
  }

  y += 40; // Add some space

  // Filter transactions
  let filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.timestamp);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const inDateRange = transactionDate >= start && transactionDate <= end;
    const inClass = !className || t.className === className;
    return inDateRange && inClass;
  });

  if (type === 'teacher') {
    filteredTransactions = filteredTransactions.filter(t => t.eventType);
  }

  // Sort by timestamp
  filteredTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  if (filteredTransactions.length === 0) {
    ctx.fillStyle = '#666666';
    ctx.font = bodyFont;
    ctx.textAlign = 'center';
    ctx.fillText('No data found for the selected period.', canvas.width / 2, y + 100);
  } else {
    // Table header
    ctx.fillStyle = '#1976D2';
    ctx.font = headerFont;
    ctx.textAlign = 'left';
    ctx.fillText('Student', 100, y);
    ctx.fillText('Status', 400, y);
    ctx.fillText('Time', 800, y);
    if (type === 'teacher') {
      ctx.fillText('Event', 1200, y);
    }
    y += 60;

    // Draw separator line
    ctx.strokeStyle = '#1976D2';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, y - 20);
    ctx.lineTo(canvas.width - 100, y - 20);
    ctx.stroke();

    // Table rows
    ctx.font = bodyFont;
    ctx.fillStyle = '#424242';

    for (const transaction of filteredTransactions) {
      if (y > canvas.height - 200) {
        // Add new page indicator
        ctx.fillStyle = '#999999';
        ctx.font = smallFont;
        ctx.textAlign = 'center';
        ctx.fillText('(Report continues on next page)', canvas.width / 2, canvas.height - 50);
        break;
      }

      // Use stored studentIdentifier
      const studentIdentifier = transaction.studentIdentifier || transaction.studentLabel;

      ctx.textAlign = 'left';
      ctx.fillText(studentIdentifier, 100, y);
      ctx.fillText(transaction.status, 400, y);
      ctx.fillText(new Date(transaction.timestamp).toLocaleString(), 800, y);
      if (type === 'teacher' && transaction.eventType) {
        ctx.fillText(transaction.eventType, 1200, y);
      }

      y += 50;
    }
  }

  // Footer
  ctx.fillStyle = '#999999';
  ctx.font = smallFont;
  ctx.textAlign = 'center';
  ctx.fillText(`Total Records: ${filteredTransactions.length}`, canvas.width / 2, canvas.height - 80);
  ctx.fillText('Generated by ScholarTrack', canvas.width / 2, canvas.height - 50);

  // Convert canvas to blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        throw new Error('Failed to generate image blob');
      }
    }, 'image/jpeg', 0.9);
  });
};
</script>
