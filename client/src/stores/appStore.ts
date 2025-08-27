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
  
  // Authentication state
  const isAuthenticated: Ref<boolean> = ref(false)

  // Database
  let db: IDBPDatabase<DatabaseSchema> | null = null

  // Initialize IndexedDB
  const initDB = async (): Promise<void> => {
    try {
      console.log('Initializing IndexedDB...')
      
      db = await openDB<DatabaseSchema>('scholartrack', 4, {
        upgrade(db: unknown, oldVersion: number, newVersion: number) {
          const database = db as IDBPDatabase<DatabaseSchema>
          console.log(`Upgrading database from version ${oldVersion} to ${newVersion}...`)
          
          // Students store
          if (!database.objectStoreNames.contains('students')) {
            const studentStore = database.createObjectStore('students', { keyPath: 'id' })
            studentStore.createIndex('label', 'label', { unique: false })
            studentStore.createIndex('code', 'code', { unique: true })
            // New unique constraint: combination of label and emoji
            studentStore.createIndex('labelEmoji', ['label', 'emoji'], { unique: true })
          } else if (oldVersion < 4) {
            // Migration: Update to label+emoji unique constraint
            console.log('IndexedDB migration: Updating to version 4 with label+emoji unique constraint')
            // The new schema will be created automatically for new databases
            // Existing databases will need to be cleared manually if they have conflicts
          }
          
          // Classes store
          if (!database.objectStoreNames.contains('classes')) {
            const classStore = database.createObjectStore('classes', { keyPath: 'id' })
            classStore.createIndex('name', 'name', { unique: true })
          }
          
          // Transactions store
          if (!database.objectStoreNames.contains('transactions')) {
            const transactionStore = database.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true })
            transactionStore.createIndex('studentLabel', 'studentLabel')
            transactionStore.createIndex('timestamp', 'timestamp')
            transactionStore.createIndex('className', 'className')
          }
          
          // Style settings store
          if (!database.objectStoreNames.contains('styleSettings')) {
            database.createObjectStore('styleSettings', { keyPath: 'id' })
          }
        }
      })
      
      console.log('Database initialized, loading data...')
      
      await loadData()
      console.log('Data loaded successfully')
      
      // Try to load from server if we have no local data (but don't fail if server is down)
      if (students.value.length === 0 && classes.value.length === 0) {
        console.log('No local data found, attempting to load from server...')
        try {
          await loadFromServer()
        } catch (error) {
          console.warn('Server not available, continuing with local data only:', error)
          // Don't fail the app initialization if server is down
        }
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
      
      // Initialize default style settings if none exist
      if (settingsData.length > 0) {
        styleSettings.value = settingsData[0]
      } else {
        // Create default style settings
        const defaultSettings: StyleSettings = {
          id: 'default',
          primaryColor: '#1976D2',
          secondaryColor: '#424242',
          tertiaryColor: '#000000',
          quaternaryColor: '#121212',
          schoolName: 'ScholarTrack',
          logoImage: '',
          updatedAt: new Date().toISOString()
        }
        styleSettings.value = defaultSettings
        // Save default settings to database
        await db.put('styleSettings', defaultSettings)
      }
      
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

  const getStudentStatus = (studentCode: string): StudentStatus => {
    const studentTransactions = transactions.value
      .filter((t: Transaction) => t.studentCode === studentCode && t.className === currentClass.value?.name)
      .sort((a: Transaction, b: Transaction) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    return studentTransactions.length > 0 && studentTransactions[0] ? studentTransactions[0].status : 'IN CLASS'
  }

  // Actions
  const addStudent = async (student: NewStudent): Promise<void> => {
    if (!db) {
      console.error('Database not initialized')
      throw new Error('Database not initialized')
    }
    
    try {
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
      
      console.log('Adding student:', { label: newStudent.label, emoji: newStudent.emoji, code: newStudent.code })
      
      // Use idb library's convenience method
      await db.add('students', dbStudent)
      
      students.value.push(newStudent)
      
      console.log('Student added successfully, syncing to server...')
      
      // Sync to server
      await syncToServer()
      
      console.log('Student added and synced successfully')
    } catch (error) {
      console.error('Error adding student:', error)
      if (error instanceof Error && error.name === 'ConstraintError') {
        throw new Error(`A student with label "${student.label}" and emoji "${student.emoji}" already exists`)
      }
      throw error
    }
  }

  const updateStudent = async (student: Student): Promise<void> => {
    if (!db) {
      console.error('Database not initialized')
      throw new Error('Database not initialized')
    }
    
    try {
      // Convert classes array to JSON string for IndexedDB storage
      const dbStudent = {
        id: student.id,
        label: student.label,
        code: student.code,
        emoji: student.emoji,
        classes: JSON.stringify(student.classes),
        createdAt: student.createdAt
      }
      
      console.log('Updating student:', { id: student.id, label: student.label, emoji: student.emoji })
      
      // Use idb library's convenience method
      await db.put('students', dbStudent)
      
      const index = students.value.findIndex((s: Student) => s.id === student.id)
      if (index !== -1) {
        students.value[index] = student
      }
      
      console.log('Student updated successfully, syncing to server...')
      
      // Sync to server
      await syncToServer()
      
      console.log('Student updated and synced successfully')
    } catch (error) {
      console.error('Error updating student:', error)
      if (error instanceof Error && error.name === 'ConstraintError') {
        throw new Error(`A student with label "${student.label}" and emoji "${student.emoji}" already exists`)
      }
      throw error
    }
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
    if (!db) {
      console.error('Database not initialized')
      throw new Error('Database not initialized')
    }
    
    try {
      const newClass: Class = {
        id: crypto.randomUUID(),
        name: className,
        createdAt: new Date().toISOString()
      }
      
      console.log('Adding class:', newClass)
      
      // Use idb library's convenience method
      await db.add('classes', newClass)
      
      classes.value.push(newClass)
      
      console.log('Class added successfully, syncing to server...')
      
      // Sync to server
      await syncToServer()
      
      console.log('Class added and synced successfully')
    } catch (error) {
      console.error('Error adding class:', error)
      throw error
    }
  }

  const updateClass = async (classData: Class): Promise<void> => {
    if (!db) return
    
    // Use idb library's convenience method
    await db.put('classes', classData)
    
    const index = classes.value.findIndex((c: Class) => c.id === classData.id)
    if (index !== -1) {
      classes.value[index] = classData
    }
    
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
      currentClass.value = classes.value.length > 0 && classes.value[0] ? classes.value[0] : null
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

  const addTransaction = async (transaction: Omit<Transaction, 'timestamp' | 'className' | 'studentIdentifier'> & { studentCode: string }): Promise<void> => {
    if (!db) return
    
    // Find the student by their unique code for precise identification
    const student = students.value.find((s: Student) => s.code === transaction.studentCode)
    const emojiName = student ? getNameByEmoji(student.emoji) || student.emoji : ''
    const studentIdentifier = student ? `${student.label}-${emojiName}` : transaction.studentLabel
    
    const newTransaction: Transaction = {
      ...transaction,
      studentCode: transaction.studentCode,
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
      console.log(`Changing mode to: ${mode}`)
      currentMode.value = mode
      showModeModal.value = false
      tempCode.value = ''
      // Update authentication state
      if (isAuthMode(mode)) {
        isAuthenticated.value = true
        console.log('Set authenticated to true (via changeMode)')
      } else {
        // Switching to STANDARD mode clears authentication
        isAuthenticated.value = false
        console.log('Set authenticated to false (via changeMode)')
      }
    }
  }

  // Helper function to determine if a mode requires authentication
  const isAuthMode = (mode: AppMode): boolean => {
    return mode !== 'STANDARD'
  }

  // Helper function to determine if authentication is required for mode switching
  const requiresAuthForModeSwitch = (fromMode: AppMode, toMode: AppMode): boolean => {
    // If switching to STANDARD, no auth required
    if (toMode === 'STANDARD') {
      return false
    }
    
    // If switching from STANDARD to an auth mode, auth required
    if (fromMode === 'STANDARD' && isAuthMode(toMode)) {
      return true
    }
    
    // If already in an auth mode and switching to another auth mode, no auth required
    if (isAuthMode(fromMode) && isAuthMode(toMode)) {
      return false
    }
    
    // Default: auth required
    return true
  }

  // Function to handle mode switching with proper auth logic
  const switchMode = (newMode: AppMode): void => {
    const currentModeValue = currentMode.value
    
    console.log(`Mode switch request: ${currentModeValue} -> ${newMode}`)
    console.log(`Current auth state: ${isAuthenticated.value}`)
    console.log(`Auth required: ${requiresAuthForModeSwitch(currentModeValue, newMode)}`)
    
    // If no auth required, switch directly
    if (!requiresAuthForModeSwitch(currentModeValue, newMode)) {
      console.log('No auth required, switching directly')
      currentMode.value = newMode
      // Update authentication state
      if (isAuthMode(newMode)) {
        isAuthenticated.value = true
        console.log('Set authenticated to true')
      } else {
        isAuthenticated.value = false
        console.log('Set authenticated to false')
      }
      return
    }
    
    // If auth required, show modal
    console.log('Auth required, showing modal')
    tempMode.value = newMode
    showModeModal.value = true
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
    if (styleSettings.value) {
      return styleSettings.value
    }
    
    // Return default settings if none exist
    return {
      id: 'default',
      primaryColor: '#1976D2',
      secondaryColor: '#424242',
      tertiaryColor: '#000000',
      quaternaryColor: '#121212',
      schoolName: 'ScholarTrack',
      logoImage: '',
      updatedAt: new Date().toISOString()
    }
  }

  // Enhanced sync methods for Up Sync, Down Sync, and Full Sync
  const syncToServer = async (): Promise<void> => {
    try {
      const response = await fetch('/api/sync/up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: students.value,
          classes: classes.value,
          transactions: transactions.value,
          styleSettings: styleSettings.value
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Up sync completed:', result)
    } catch (error) {
      console.error('Failed to up sync to server:', error)
      throw error
    }
  }

  const loadFromServer = async (): Promise<void> => {
    try {
      // First check if server is available
      const healthResponse = await fetch('/api/health')
      if (!healthResponse.ok) {
        throw new Error('Server not available')
      }
      
      const response = await fetch('/api/sync/down')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Update local state with server data
      students.value = result.data.students || []
      classes.value = result.data.classes || []
      transactions.value = result.data.transactions || []
      styleSettings.value = result.data.styleSettings || null
      
      // Set current class if available
      if (result.data.classes && result.data.classes.length > 0 && !currentClass.value) {
        currentClass.value = result.data.classes[0]
      }
      
      console.log('Down sync completed:', result)
    } catch (error) {
      console.error('Failed to down sync from server:', error)
      throw error
    }
  }

  const fullSync = async (): Promise<void> => {
    try {
      const response = await fetch('/api/sync/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: students.value,
          classes: classes.value,
          transactions: transactions.value,
          styleSettings: styleSettings.value
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Update local state with server data from full sync
      students.value = result.data.students || []
      classes.value = result.data.classes || []
      transactions.value = result.data.transactions || []
      styleSettings.value = result.data.styleSettings || null
      
      // Set current class if available
      if (result.data.classes && result.data.classes.length > 0 && !currentClass.value) {
        currentClass.value = result.data.classes[0]
      }
      
      console.log('Full sync completed:', result)
    } catch (error) {
      console.error('Failed to full sync with server:', error)
      throw error
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
    isAuthenticated,
    
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
    updateClass,
    removeClass,
    addTransaction,
    changeMode,
    changeClass,
    openStudentModal,
    closeStudentModal,
    updateStyleSettings,
    getStyleSettings,
    syncToServer,
    loadFromServer,
    fullSync,
    
    // Authentication methods
    isAuthMode,
    requiresAuthForModeSwitch,
    switchMode
  }
})
