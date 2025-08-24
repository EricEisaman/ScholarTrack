import { defineStore } from 'pinia'
import { ref, computed, Ref } from 'vue'
import { openDB, IDBPDatabase } from 'idb'
import type { 
  Student, 
  Class, 
  Transaction, 
  StudentStatus, 
  TeacherEventType, 
  AppMode, 
  StatusColor, 
  NewStudent 
} from '../types'

interface DatabaseSchema {
  students: Student
  classes: Class
  transactions: Transaction
}

export const useAppStore = defineStore('app', () => {
  // State
  const currentMode: Ref<AppMode> = ref('STANDARD')
  const currentClass: Ref<Class | null> = ref(null)
  const students: Ref<Student[]> = ref([])
  const classes: Ref<Class[]> = ref([])
  const transactions: Ref<Transaction[]> = ref([])
  const teacherCode: Ref<string> = ref('1234') // Default teacher code
  const showModeModal: Ref<boolean> = ref(false)
  const showClassModal: Ref<boolean> = ref(false)
  const showStudentModal: Ref<boolean> = ref(false)
  const selectedStudent: Ref<Student | null> = ref(null)
  const tempMode: Ref<AppMode> = ref('STANDARD')
  const tempClass: Ref<string> = ref('')
  const tempCode: Ref<string> = ref('')

  // Database
  let db: IDBPDatabase<DatabaseSchema> | null = null

  // Initialize IndexedDB
  const initDB = async (): Promise<void> => {
    db = await openDB<DatabaseSchema>('scholartrack', 1, {
      upgrade(db: any) {
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
  const loadData = async (): Promise<void> => {
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
  const statusColors: StatusColor = {
    DEFAULT: '#1976D2',
    RESTROOM: '#FF9800',
    OFFICE: '#F44336',
    COUNSELOR: '#9C27B0',
    LIBRARY: '#4CAF50',
    'TEACHER VISIT': '#607D8B'
  }

  // Teacher event types
  const teacherEvents: TeacherEventType[] = [
    'PHONE OUT IN CLASS',
    'BAD LANGUAGE',
    'OUT OF ASSIGNED SEAT',
    'HORSE PLAY'
  ]

  // Computed properties
  const currentClassStudents = computed((): Student[] => {
    if (!currentClass.value) return []
    return students.value.filter((student: Student) => 
      student.classes.includes(currentClass.value!.name)
    )
  })

  const getStudentStatus = (studentLabel: string): StudentStatus => {
    const studentTransactions = transactions.value
      .filter((t: Transaction) => t.studentLabel === studentLabel && t.className === currentClass.value?.name)
      .sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return studentTransactions.length > 0 ? studentTransactions[0].status : 'DEFAULT'
  }

  // Actions
  const addStudent = async (student: NewStudent): Promise<void> => {
    if (!db) return
    
    const newStudent: Student = {
      id: crypto.randomUUID(),
      ...student,
      createdAt: new Date().toISOString()
    }
    
    await db.add('students', newStudent)
    students.value.push(newStudent)
  }

  const updateStudent = async (student: Student): Promise<void> => {
    if (!db) return
    
    await db.put('students', student)
    const index = students.value.findIndex((s: Student) => s.id === student.id)
    if (index !== -1) {
      students.value[index] = student
    }
  }

  const removeStudent = async (studentId: string): Promise<void> => {
    if (!db) return
    
    await db.delete('students', studentId)
    students.value = students.value.filter((s: Student) => s.id !== studentId)
  }

  const addClass = async (className: string): Promise<void> => {
    if (!db) return
    
    const newClass: Class = {
      id: crypto.randomUUID(),
      name: className,
      createdAt: new Date().toISOString()
    }
    
    await db.add('classes', newClass)
    classes.value.push(newClass)
  }

  const addTransaction = async (transaction: Omit<Transaction, 'timestamp' | 'className'>): Promise<void> => {
    if (!db) return
    
    const newTransaction: Transaction = {
      ...transaction,
      timestamp: new Date().toISOString(),
      className: currentClass.value?.name || ''
    }
    
    await db.add('transactions', newTransaction)
    transactions.value.push(newTransaction)
  }

  const changeMode = (mode: AppMode): void => {
    if (tempCode.value === teacherCode.value) {
      currentMode.value = mode
      showModeModal.value = false
      tempCode.value = ''
    }
  }

  const changeClass = (className: string): void => {
    if (tempCode.value === teacherCode.value) {
      const foundClass = classes.value.find((c: Class) => c.name === className)
      if (foundClass) {
        currentClass.value = foundClass
      }
      showClassModal.value = false
      tempCode.value = ''
    }
  }

  const openStudentModal = (student: Student): void => {
    selectedStudent.value = student
    showStudentModal.value = true
  }

  const closeStudentModal = (): void => {
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
