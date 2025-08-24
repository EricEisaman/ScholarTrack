import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { openDB } from 'idb'

export const useAppStore = defineStore('app', () => {
  // State
  const currentMode = ref('STANDARD')
  const currentClass = ref(null)
  const students = ref([])
  const classes = ref([])
  const transactions = ref([])
  const teacherCode = ref('1234') // Default teacher code
  const showModeModal = ref(false)
  const showClassModal = ref(false)
  const showStudentModal = ref(false)
  const selectedStudent = ref(null)
  const tempMode = ref('')
  const tempClass = ref('')
  const tempCode = ref('')

  // Database
  let db = null

  // Initialize IndexedDB
  const initDB = async () => {
    db = await openDB('scholartrack', 1, {
      upgrade(db) {
        // Students store
        if (!db.objectStoreNames.contains('students')) {
          const studentStore = db.createObjectStore('students', { keyPath: 'id' })
          studentStore.createIndex('label', 'label', { unique: true })
          studentStore.createIndex('code', 'code', { unique: true })
        }
        
        // Classes store
        if (!db.objectStoreNames.contains('classes')) {
          const classStore = db.createObjectStore('classes', { keyPath: 'id' })
          classStore.createIndex('name', 'name', { unique: true })
        }
        
        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true })
          transactionStore.createIndex('studentLabel', 'studentLabel')
          transactionStore.createIndex('timestamp', 'timestamp')
          transactionStore.createIndex('className', 'className')
        }
      }
    })
    
    await loadData()
  }

  // Load data from IndexedDB
  const loadData = async () => {
    if (!db) return
    
    const studentTx = db.transaction('students', 'readonly')
    const classTx = db.transaction('classes', 'readonly')
    const transactionTx = db.transaction('transactions', 'readonly')
    
    students.value = await studentTx.store.getAll()
    classes.value = await classTx.store.getAll()
    transactions.value = await transactionTx.store.getAll()
    
    if (classes.value.length > 0 && !currentClass.value) {
      currentClass.value = classes.value[0]
    }
  }

  // Student status colors
  const statusColors = {
    DEFAULT: '#1976D2',
    RESTROOM: '#FF9800',
    OFFICE: '#F44336',
    COUNSELOR: '#9C27B0',
    LIBRARY: '#4CAF50',
    'TEACHER VISIT': '#607D8B'
  }

  // Teacher event types
  const teacherEvents = [
    'PHONE OUT IN CLASS',
    'BAD LANGUAGE',
    'OUT OF ASSIGNED SEAT',
    'HORSE PLAY'
  ]

  // Computed properties
  const currentClassStudents = computed(() => {
    if (!currentClass.value) return []
    return students.value.filter(student => 
      student.classes.includes(currentClass.value.name)
    )
  })

  const getStudentStatus = (studentLabel) => {
    const studentTransactions = transactions.value
      .filter(t => t.studentLabel === studentLabel && t.className === currentClass.value?.name)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    
    return studentTransactions.length > 0 ? studentTransactions[0].status : 'DEFAULT'
  }

  // Actions
  const addStudent = async (student) => {
    if (!db) return
    
    const newStudent = {
      id: crypto.randomUUID(),
      ...student,
      createdAt: new Date().toISOString()
    }
    
    await db.add('students', newStudent)
    students.value.push(newStudent)
  }

  const updateStudent = async (student) => {
    if (!db) return
    
    await db.put('students', student)
    const index = students.value.findIndex(s => s.id === student.id)
    if (index !== -1) {
      students.value[index] = student
    }
  }

  const removeStudent = async (studentId) => {
    if (!db) return
    
    await db.delete('students', studentId)
    students.value = students.value.filter(s => s.id !== studentId)
  }

  const addClass = async (className) => {
    if (!db) return
    
    const newClass = {
      id: crypto.randomUUID(),
      name: className,
      createdAt: new Date().toISOString()
    }
    
    await db.add('classes', newClass)
    classes.value.push(newClass)
  }

  const addTransaction = async (transaction) => {
    if (!db) return
    
    const newTransaction = {
      ...transaction,
      timestamp: new Date().toISOString(),
      className: currentClass.value?.name
    }
    
    await db.add('transactions', newTransaction)
    transactions.value.push(newTransaction)
  }

  const changeMode = (mode) => {
    if (tempCode.value === teacherCode.value) {
      currentMode.value = mode
      showModeModal.value = false
      tempCode.value = ''
    }
  }

  const changeClass = (className) => {
    if (tempCode.value === teacherCode.value) {
      currentClass.value = classes.value.find(c => c.name === className)
      showClassModal.value = false
      tempCode.value = ''
    }
  }

  const openStudentModal = (student) => {
    selectedStudent.value = student
    showStudentModal.value = true
  }

  const closeStudentModal = () => {
    showStudentModal.value = false
    selectedStudent.value = null
  }

  return {
    // State
    currentMode,
    currentClass,
    students,
    classes,
    transactions,
    teacherCode,
    showModeModal,
    showClassModal,
    showStudentModal,
    selectedStudent,
    tempMode,
    tempClass,
    tempCode,
    
    // Computed
    currentClassStudents,
    statusColors,
    teacherEvents,
    
    // Methods
    initDB,
    loadData,
    getStudentStatus,
    addStudent,
    updateStudent,
    removeStudent,
    addClass,
    addTransaction,
    changeMode,
    changeClass,
    openStudentModal,
    closeStudentModal
  }
})
