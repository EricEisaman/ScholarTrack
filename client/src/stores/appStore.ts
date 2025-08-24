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
  NewStudent,
  StyleSettings
} from '../types'
import { getNameByEmoji } from '../data/emojis'

interface DatabaseSchema {
  students: Student
  classes: Class
  transactions: Transaction
  styleSettings: StyleSettings
}

export const useAppStore = defineStore('app', () => {
  // State
  const currentMode: Ref<AppMode> = ref('STANDARD')
  const currentClass: Ref<Class | null> = ref(null)
  const students: Ref<Student[]> = ref([])
  const classes: Ref<Class[]> = ref([])
  const transactions: Ref<Transaction[]> = ref([])
  const styleSettings: Ref<StyleSettings | null> = ref(null)
  const teacherCode: Ref<string> = ref((import.meta as any).env?.VITE_TEACHER_CODE || '456789') // Get from environment variable
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
    try {
      console.log('Initializing IndexedDB...')
      
      db = await openDB<DatabaseSchema>('scholartrack', 3, {
        upgrade(db: any, oldVersion: number, newVersion: number) {
          console.log(`Upgrading database from version ${oldVersion} to ${newVersion}...`)
          
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
          
          // Style settings store
          if (!db.objectStoreNames.contains('styleSettings')) {
            db.createObjectStore('styleSettings', { keyPath: 'id' })
          }
        }
      })
      
      console.log('Database initialized, loading data...')
      
      await loadData()
      console.log('Data loaded successfully')
      
      // Try to load from server if we have no local data
      if (students.value.length === 0 && classes.value.length === 0) {
        console.log('No local data found, attempting to load from server...')
        await loadFromServer()
      }
      
    } catch (error) {
      console.error('Error initializing database:', error)
      // Initialize with empty data if database fails
      students.value = []
      classes.value = []
      transactions.value = []
      styleSettings.value = null
    }
  }



  // Load data from IndexedDB using safe idb patterns
  const loadData = async (): Promise<void> => {
    if (!db) return
    
    try {
      console.log('Loading data from IndexedDB...')
      
      // Use idb library's convenience methods - they handle transactions safely
      const studentsData = await db.getAll('students')
      const classesData = await db.getAll('classes')
      const transactionsData = await db.getAll('transactions')
      const settingsData = await db.getAll('styleSettings')
      
      console.log('Data loaded successfully:', { 
        students: studentsData.length, 
        classes: classesData.length, 
        transactions: transactionsData.length,
        settings: settingsData.length 
      })
      
      // Parse classes arrays from JSON strings
      const parsedStudents = studentsData.map(student => ({
        ...student,
        classes: typeof student.classes === 'string' ? JSON.parse(student.classes) : student.classes
      }))
      
      // Update reactive state
      students.value = parsedStudents
      classes.value = classesData
      transactions.value = transactionsData
      styleSettings.value = settingsData.length > 0 ? settingsData[0] : null
      
      if (classesData.length > 0 && !currentClass.value) {
        currentClass.value = classesData[0]
      }
    } catch (error) {
      console.error('Error loading data from IndexedDB:', error)
      // Initialize with empty arrays if database is not ready
      students.value = []
      classes.value = []
      transactions.value = []
      styleSettings.value = null
    }
  }

  // Student status colors
  const statusColors: StatusColor = {
    'IN CLASS': '#1976D2',
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
    
    return studentTransactions.length > 0 ? studentTransactions[0].status : 'IN CLASS'
  }

  // Actions
  const addStudent = async (student: NewStudent): Promise<void> => {
    if (!db) return
    
    const newStudent: Student = {
      id: crypto.randomUUID(),
      label: student.label,
      code: student.code,
      emoji: student.emoji,
      classes: student.classes, // Keep as array for in-memory
      createdAt: new Date().toISOString()
    }
    
    // Convert classes array to JSON string for IndexedDB storage
    const dbStudent = {
      id: newStudent.id,
      label: newStudent.label,
      code: newStudent.code,
      emoji: newStudent.emoji,
      classes: JSON.stringify(student.classes),
      createdAt: newStudent.createdAt
    }
    
    // Use idb library's convenience method
    await db.add('students', dbStudent)
    
    students.value.push(newStudent)
    
    // Sync to server
    await syncToServer()
  }

  const updateStudent = async (student: Student): Promise<void> => {
    if (!db) return
    
    // Convert classes array to JSON string for IndexedDB storage
    const dbStudent = {
      id: student.id,
      label: student.label,
      code: student.code,
      emoji: student.emoji,
      classes: JSON.stringify(student.classes),
      createdAt: student.createdAt
    }
    
    // Use idb library's convenience method
    await db.put('students', dbStudent)
    
    const index = students.value.findIndex((s: Student) => s.id === student.id)
    if (index !== -1) {
      students.value[index] = student
    }
    
    // Sync to server
    await syncToServer()
  }

  const removeStudent = async (studentId: string): Promise<void> => {
    if (!db) return
    
    // Use idb library's convenience method
    await db.delete('students', studentId)
    
    students.value = students.value.filter((s: Student) => s.id !== studentId)
    
    // Sync to server
    await syncToServer()
  }

  const addClass = async (className: string): Promise<void> => {
    if (!db) return
    
    const newClass: Class = {
      id: crypto.randomUUID(),
      name: className,
      createdAt: new Date().toISOString()
    }
    
    // Use idb library's convenience method
    await db.add('classes', newClass)
    
    classes.value.push(newClass)
    
    // Sync to server
    await syncToServer()
  }

  const removeClass = async (classId: string): Promise<void> => {
    if (!db) return
    
    // Find the class to get its name
    const classToRemove = classes.value.find((c: Class) => c.id === classId)
    if (!classToRemove) return
    
    // Remove the class from IndexedDB
    await db.delete('classes', classId)
    
    // Remove the class from reactive state
    classes.value = classes.value.filter((c: Class) => c.id !== classId)
    
    // If this was the current class, switch to the first available class or null
    if (currentClass.value?.id === classId) {
      currentClass.value = classes.value.length > 0 ? classes.value[0] : null
    }
    
    // Remove students that belong to this class
    const studentsToRemove = students.value.filter((s: Student) => 
      s.classes.includes(classToRemove.name)
    )
    
    for (const student of studentsToRemove) {
      // Remove the class from the student's classes array
      const updatedClasses = student.classes.filter((c: string) => c !== classToRemove.name)
      
      if (updatedClasses.length === 0) {
        // If student has no classes left, remove the student entirely
        await db.delete('students', student.id)
        students.value = students.value.filter((s: Student) => s.id !== student.id)
      } else {
        // Update the student's classes
        const updatedStudent = { ...student, classes: updatedClasses }
        await db.put('students', {
          ...updatedStudent,
          classes: JSON.stringify(updatedClasses) // Serialize for IndexedDB
        })
        
              // Update in reactive state
      const index = students.value.findIndex((s: Student) => s.id === student.id)
      if (index !== -1) {
        students.value[index] = updatedStudent
      }
    }
    
    // Sync to server
    await syncToServer()
  }
  }

  const addTransaction = async (transaction: Omit<Transaction, 'timestamp' | 'className' | 'studentIdentifier'>): Promise<void> => {
    if (!db) return
    
    // Find the student to get their emoji name for the identifier
    const student = students.value.find((s: Student) => s.label === transaction.studentLabel)
    const emojiName = student ? getNameByEmoji(student.emoji) || student.emoji : ''
    const studentIdentifier = student ? `${transaction.studentLabel}-${emojiName}` : transaction.studentLabel
    
    const newTransaction: Transaction = {
      ...transaction,
      studentIdentifier,
      timestamp: new Date().toISOString(),
      className: currentClass.value?.name || ''
    }
    
    // Use idb library's convenience method
    await db.add('transactions', newTransaction)
    
    transactions.value.push(newTransaction)
    
    // Sync to server
    await syncToServer()
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

  // Style settings methods
  const updateStyleSettings = async (settings: Omit<StyleSettings, 'id' | 'updatedAt'>): Promise<void> => {
    if (!db) return
    
    const newSettings: StyleSettings = {
      id: 'default',
      ...settings,
      updatedAt: new Date().toISOString()
    }
    
    // Use idb library's convenience method
    await db.put('styleSettings', newSettings)
    
    styleSettings.value = newSettings
  }

  const getStyleSettings = (): StyleSettings | null => {
    return styleSettings.value
  }

  // Sync methods for server synchronization
  const syncToServer = async (): Promise<void> => {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: students.value,
          classes: classes.value,
          transactions: transactions.value
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Sync to server completed:', result)
    } catch (error) {
      console.error('Failed to sync to server:', error)
      // Don't throw - sync failures shouldn't break the app
    }
  }

  const loadFromServer = async (): Promise<void> => {
    try {
      const response = await fetch('/api/data')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Update local state with server data
      students.value = data.students || []
      classes.value = data.classes || []
      transactions.value = data.transactions || []
      
      // Set current class if available
      if (data.classes && data.classes.length > 0 && !currentClass.value) {
        currentClass.value = data.classes[0]
      }
      
      console.log('Loaded data from server:', data)
    } catch (error) {
      console.error('Failed to load from server:', error)
      // Don't throw - server load failures shouldn't break the app
    }
  }

  return {
    // State
    currentMode,
    currentClass,
    students,
    classes,
    transactions,
    styleSettings,
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
    removeClass,
    addTransaction,
    changeMode,
    changeClass,
    openStudentModal,
    closeStudentModal,
    updateStyleSettings,
    getStyleSettings,
    syncToServer,
    loadFromServer
  }
})
