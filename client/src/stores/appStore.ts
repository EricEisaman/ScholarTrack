import { defineStore } from 'pinia'
import { ref, computed, Ref } from 'vue'
import { openDB, IDBPDatabase, deleteDB } from 'idb'
import type { 
  Student, 
  Class, 
  Transaction, 
  StudentStatus,
  TeacherEventType, 
  AppMode, 
  StatusColor, 
  NewStudent,
  StyleSettings,
  CustomStatusType,
  CustomTeacherEventType,
  ValidationResult
} from '../types'
import { getNameByEmoji } from '../data/emojis'
import { 
  validateCustomStatusType, 
  validateCustomTeacherEventType, 
  normalizeName,
  sanitizeInput 
} from '../utils/validation'
import {
  createDatabaseSnapshot,
  performSafeMigration,
  createMigrationOperation,
  SnapshotManager,
  restoreFromSnapshot as restoreFromSnapshotUtil
} from '../utils/databaseSnapshot'
import type { MigrationResult, DatabaseSnapshot } from '../types'

interface DatabaseSchema {
  students: Student
  classes: Class
  transactions: Transaction
  styleSettings: StyleSettings
  customStatusTypes: CustomStatusType
  customTeacherEventTypes: CustomTeacherEventType
}

export const useAppStore = defineStore('app', () => {
  // State
  const currentMode: Ref<AppMode> = ref('STANDARD')
  const currentClass: Ref<Class | null> = ref(null)
  const students: Ref<Student[]> = ref([])
  const classes: Ref<Class[]> = ref([])
  const transactions: Ref<Transaction[]> = ref([])
  const styleSettings: Ref<StyleSettings | null> = ref(null)
  const customStatusTypes: Ref<CustomStatusType[]> = ref([])
  const customTeacherEventTypes: Ref<CustomTeacherEventType[]> = ref([])
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

  // Ensure database is ready for operations
  const ensureDBReady = async (): Promise<void> => {
    if (!db) {
      console.log('Database not initialized, initializing now...')
      await initDB(false)
    }
    
    // Verify all required object stores exist
    const requiredStores = ['students', 'classes', 'transactions', 'styleSettings', 'customStatusTypes', 'customTeacherEventTypes']
    const missingStores = requiredStores.filter(storeName => !db!.objectStoreNames.contains(storeName))
    
    if (missingStores.length > 0) {
      console.error('Missing object stores:', missingStores)
      console.log('Database schema is outdated, recreating database with data preservation...')
      
      // Backup existing data before recreating database
      const existingData = {
        students: students.value,
        classes: classes.value,
        transactions: transactions.value,
        styleSettings: styleSettings.value,
        customStatusTypes: customStatusTypes.value,
        customTeacherEventTypes: customTeacherEventTypes.value
      }
      
      // Close the current database connection
      if (db) {
        db.close()
        db = null
      }
      
      // Delete the existing database and recreate it
      await deleteDatabase()
      await initDB()
      
      // Verify the recreation worked
      const newMissingStores = requiredStores.filter(storeName => !db!.objectStoreNames.contains(storeName))
      if (newMissingStores.length > 0) {
        throw new Error(`Database schema is still missing required object stores after recreation: ${newMissingStores.join(', ')}`)
      }
      
      // Restore the data to the new database
      console.log('Restoring data to new database...')
      await restoreDataToNewDatabase(existingData)
    }
  }

  // Delete the existing database
  const deleteDatabase = async (): Promise<void> => {
    try {
      console.log('Deleting existing database...')
      await deleteDB('scholartrack')
      console.log('Database deleted successfully')
    } catch (error) {
      console.error('Error deleting database:', error)
      throw error
    }
  }

  // Restore data to the newly created database
  const restoreDataToNewDatabase = async (data: {
    students: Student[]
    classes: Class[]
    transactions: Transaction[]
    styleSettings: StyleSettings | null
    customStatusTypes: CustomStatusType[]
    customTeacherEventTypes: CustomTeacherEventType[]
  }): Promise<void> => {
    if (!db) throw new Error('Database not initialized')
    
    try {
      console.log('Restoring data to new database...')
      
      // Restore students
      for (const student of data.students) {
        const dbStudent = {
          ...student,
          classes: typeof student.classes === 'string' ? student.classes : JSON.stringify(student.classes)
        }
        await db.add('students', dbStudent)
      }
      
      // Restore classes
      for (const classData of data.classes) {
        await db.add('classes', classData)
      }
      
      // Restore transactions
      for (const transaction of data.transactions) {
        await db.add('transactions', transaction)
      }
      
      // Restore style settings
      if (data.styleSettings) {
        await db.add('styleSettings', data.styleSettings)
      }
      
      // Restore custom status types
      for (const statusType of data.customStatusTypes) {
        await db.add('customStatusTypes', statusType)
      }
      
      // Restore custom teacher event types
      for (const eventType of data.customTeacherEventTypes) {
        await db.add('customTeacherEventTypes', eventType)
      }
      
      // Update reactive state
      students.value = data.students
      classes.value = data.classes
      transactions.value = data.transactions
      styleSettings.value = data.styleSettings
      customStatusTypes.value = data.customStatusTypes
      customTeacherEventTypes.value = data.customTeacherEventTypes
      
      console.log('Data restored successfully')
    } catch (error) {
      console.error('Error restoring data to new database:', error)
      throw error
    }
  }

  // Initialize IndexedDB
  const initDB = async (isRetry: boolean = false): Promise<void> => {
    try {
      console.log('Initializing IndexedDB...')
      
      db = await openDB<DatabaseSchema>('scholartrack', 6, {
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
          
          // Custom status types store
          if (!database.objectStoreNames.contains('customStatusTypes')) {
            const customStatusStore = database.createObjectStore('customStatusTypes', { keyPath: 'id' })
            customStatusStore.createIndex('name', 'name', { unique: true })
          }
          
          // Custom teacher event types store
          if (!database.objectStoreNames.contains('customTeacherEventTypes')) {
            const customEventStore = database.createObjectStore('customTeacherEventTypes', { keyPath: 'id' })
            customEventStore.createIndex('name', 'name', { unique: true })
          }
        }
      })
      
      console.log('Database initialized, checking schema...')
      
      // Check if all required object stores exist
      const requiredStores = ['students', 'classes', 'transactions', 'styleSettings', 'customStatusTypes', 'customTeacherEventTypes']
      const missingStores = requiredStores.filter(storeName => !db!.objectStoreNames.contains(storeName))
      
      if (missingStores.length > 0 && !isRetry) {
        console.log('Missing object stores detected during initialization:', missingStores)
        console.log('Recreating database with complete schema...')
        
        // Close the current database connection
        db.close()
        db = null
        
        // Delete and recreate the database
        await deleteDatabase()
        await initDB(true) // Mark as retry to prevent infinite recursion
        return // Exit early, initDB will be called recursively
      }
      
      if (missingStores.length > 0 && isRetry) {
        console.error('Database schema is still incomplete after recreation')
        throw new Error(`Failed to create database with required object stores: ${missingStores.join(', ')}`)
      }
      
      console.log('Database schema is complete, loading data...')
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
      const customStatusData = await db.getAll('customStatusTypes')
      const customEventData = await db.getAll('customTeacherEventTypes')
      
      console.log('Data loaded successfully:', { 
        students: studentsData.length, 
        classes: classesData.length, 
        transactions: transactionsData.length,
        settings: settingsData.length,
        customStatusTypes: customStatusData.length,
        customTeacherEventTypes: customEventData.length
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
      customStatusTypes.value = customStatusData
      customTeacherEventTypes.value = customEventData
      
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
  const statusColors = computed((): StatusColor => {
    const baseColors: StatusColor = {
      'IN CLASS': '#1976D2',
      RESTROOM: '#FF9800',
      OFFICE: '#F44336',
      COUNSELOR: '#9C27B0',
      LIBRARY: '#4CAF50',
      'TEACHER VISIT': '#607D8B'
    }
    
    // Add custom status colors
    const customColors: Record<string, string> = {}
    customStatusTypes.value.forEach(status => {
      customColors[status.name] = status.color
    })
    
    return { ...baseColors, ...customColors }
  })

  // Teacher event types
  const teacherEvents = computed((): TeacherEventType[] => {
    const baseEvents: TeacherEventType[] = [
      'PHONE OUT IN CLASS',
      'BAD LANGUAGE',
      'OUT OF ASSIGNED SEAT',
      'HORSE PLAY'
    ]
    
    // Add custom event types
    const customEvents = customTeacherEventTypes.value.map(event => event.name)
    
    return [...baseEvents, ...customEvents]
  })

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

  const changeMode = async (mode: AppMode): Promise<void> => {
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
      
      // Ensure database is ready for modes that require it
      if (mode === 'MANAGE TRANSACTIONS' || mode === 'MANAGE STUDENTS' || mode === 'MANAGE CLASSES') {
        try {
          await ensureDBReady()
        } catch (error) {
          console.error('Failed to ensure database readiness:', error)
        }
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
  const switchMode = async (newMode: AppMode): Promise<void> => {
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
      
      // Ensure database is ready for modes that require it
      if (newMode === 'MANAGE TRANSACTIONS' || newMode === 'MANAGE STUDENTS' || newMode === 'MANAGE CLASSES') {
        try {
          await ensureDBReady()
        } catch (error) {
          console.error('Failed to ensure database readiness:', error)
        }
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
          styleSettings: styleSettings.value,
          customStatusTypes: customStatusTypes.value,
          customTeacherEventTypes: customTeacherEventTypes.value
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
      customStatusTypes.value = result.data.customStatusTypes || []
      customTeacherEventTypes.value = result.data.customTeacherEventTypes || []
      
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
          styleSettings: styleSettings.value,
          customStatusTypes: customStatusTypes.value,
          customTeacherEventTypes: customTeacherEventTypes.value
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
      customStatusTypes.value = result.data.customStatusTypes || []
      customTeacherEventTypes.value = result.data.customTeacherEventTypes || []
      
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

  // Custom Status Type Management
  const addCustomStatusType = async (name: string, color: string, includeMemo: boolean = false): Promise<ValidationResult> => {
    await ensureDBReady()
    
    // Sanitize and normalize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedColor = sanitizeInput(color)
    const normalizedName = normalizeName(sanitizedName)
    
    // Get existing names for validation
    const existingNames = [
      ...customStatusTypes.value.map(s => s.name),
      ...customTeacherEventTypes.value.map(e => e.name)
    ]
    
    // Validate the input
    const validation = validateCustomStatusType(normalizedName, sanitizedColor, existingNames)
    
    if (!validation.isValid) {
      return validation
    }
    
    const newStatusType: CustomStatusType = {
      id: crypto.randomUUID(),
      name: normalizedName,
      color: sanitizedColor,
      includeMemo,
      createdAt: new Date().toISOString()
    }
    
    if (!db) throw new Error('Database not initialized')
    await db.add('customStatusTypes', newStatusType)
    customStatusTypes.value.push(newStatusType)
    
    // Sync to server
    await syncToServer()
    
    return validation
  }

  const removeCustomStatusType = async (id: string): Promise<void> => {
    await ensureDBReady()
    
    // Get the status type before deletion to check if it had memo
    const statusTypeToDelete = customStatusTypes.value.find(status => status.id === id)
    
    if (!db) throw new Error('Database not initialized')
    await db.delete('customStatusTypes', id)
    customStatusTypes.value = customStatusTypes.value.filter(status => status.id !== id)
    
    // If the deleted status type had memo enabled, clean up memo data from transactions
    if (statusTypeToDelete?.includeMemo) {
      await cleanupMemoDataFromTransactions(statusTypeToDelete.name, 'status')
    }
    
    // Sync to server
    await syncToServer()
  }

  const updateCustomStatusType = async (id: string, name: string, color: string, includeMemo: boolean): Promise<ValidationResult> => {
    await ensureDBReady()
    
    // Sanitize and normalize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedColor = sanitizeInput(color)
    const normalizedName = normalizeName(sanitizedName)
    
    // Get existing names for validation (excluding current item)
    const existingNames = [
      ...customStatusTypes.value.filter(s => s.id !== id).map(s => s.name),
      ...customTeacherEventTypes.value.map(e => e.name)
    ]
    
    // Validate the input
    const validation = validateCustomStatusType(normalizedName, sanitizedColor, existingNames)
    
    if (!validation.isValid) {
      return validation
    }
    
    const updatedStatusType: CustomStatusType = {
      id,
      name: normalizedName,
      color: sanitizedColor,
      includeMemo,
      createdAt: customStatusTypes.value.find(s => s.id === id)?.createdAt || new Date().toISOString()
    }
    
    if (!db) throw new Error('Database not initialized')
    await db.put('customStatusTypes', updatedStatusType)
    const index = customStatusTypes.value.findIndex(status => status.id === id)
    if (index !== -1) {
      customStatusTypes.value[index] = updatedStatusType
    }
    
    // Sync to server
    await syncToServer()
    
    return validation
  }

  // Custom Teacher Event Type Management
  const addCustomTeacherEventType = async (name: string, includeMemo: boolean = false): Promise<ValidationResult> => {
    await ensureDBReady()
    
    // Sanitize and normalize inputs
    const sanitizedName = sanitizeInput(name)
    const normalizedName = normalizeName(sanitizedName)
    
    // Get existing names for validation
    const existingNames = [
      ...customStatusTypes.value.map(s => s.name),
      ...customTeacherEventTypes.value.map(e => e.name)
    ]
    
    // Validate the input
    const validation = validateCustomTeacherEventType(normalizedName, existingNames)
    
    if (!validation.isValid) {
      return validation
    }
    
    const newEventType: CustomTeacherEventType = {
      id: crypto.randomUUID(),
      name: normalizedName,
      includeMemo,
      createdAt: new Date().toISOString()
    }
    
    if (!db) throw new Error('Database not initialized')
    await db.add('customTeacherEventTypes', newEventType)
    customTeacherEventTypes.value.push(newEventType)
    
    // Sync to server
    await syncToServer()
    
    return validation
  }

  const removeCustomTeacherEventType = async (id: string): Promise<void> => {
    await ensureDBReady()
    
    // Get the event type before deletion to check if it had memo
    const eventTypeToDelete = customTeacherEventTypes.value.find(event => event.id === id)
    
    if (!db) throw new Error('Database not initialized')
    await db.delete('customTeacherEventTypes', id)
    customTeacherEventTypes.value = customTeacherEventTypes.value.filter(event => event.id !== id)
    
    // If the deleted event type had memo enabled, clean up memo data from transactions
    if (eventTypeToDelete?.includeMemo) {
      await cleanupMemoDataFromTransactions(eventTypeToDelete.name, 'event')
    }
    
    // Sync to server
    await syncToServer()
  }

  const updateCustomTeacherEventType = async (id: string, name: string, includeMemo: boolean): Promise<ValidationResult> => {
    if (!db) throw new Error('Database not initialized')
    
    // Sanitize and normalize inputs
    const sanitizedName = sanitizeInput(name)
    const normalizedName = normalizeName(sanitizedName)
    
    // Get existing names for validation (excluding current item)
    const existingNames = [
      ...customStatusTypes.value.map(s => s.name),
      ...customTeacherEventTypes.value.filter(e => e.id !== id).map(e => e.name)
    ]
    
    // Validate the input
    const validation = validateCustomTeacherEventType(normalizedName, existingNames)
    
    if (!validation.isValid) {
      return validation
    }
    
    const updatedEventType: CustomTeacherEventType = {
      id,
      name: normalizedName,
      includeMemo,
      createdAt: customTeacherEventTypes.value.find(e => e.id === id)?.createdAt || new Date().toISOString()
    }
    
    await db.put('customTeacherEventTypes', updatedEventType)
    const index = customTeacherEventTypes.value.findIndex(event => event.id === id)
    if (index !== -1) {
      customTeacherEventTypes.value[index] = updatedEventType
    }
    
    // Sync to server
    await syncToServer()
    
    return validation
  }

  // Helper functions for memo functionality
  const requiresMemo = (statusOrEvent: string, type: 'status' | 'event'): boolean => {
    if (type === 'status') {
      // Check if it's TEACHER VISIT (built-in status that requires memo)
      if (statusOrEvent === 'TEACHER VISIT') return true
      
      // Check custom status types
      const customStatus = customStatusTypes.value.find(s => s.name === statusOrEvent)
      return customStatus?.includeMemo || false
    } else {
      // Check custom event types
      const customEvent = customTeacherEventTypes.value.find(e => e.name === statusOrEvent)
      return customEvent?.includeMemo || false
    }
  }

  const getMemoColumnName = (statusOrEvent: string): string => {
    return `${statusOrEvent}_memo`
  }

  // Clean up memo data from transactions when a custom type with memo is deleted
  const cleanupMemoDataFromTransactions = async (deletedTypeName: string, type: 'status' | 'event'): Promise<void> => {
    if (!db) throw new Error('Database not initialized')
    
    try {
      console.log(`Cleaning up memo data for deleted ${type}: ${deletedTypeName}`)
      
      // Get all transactions that use this deleted type
      const allTransactions = await db.getAll('transactions')
      const transactionsToUpdate: Transaction[] = []
      
      for (const transaction of allTransactions) {
        let shouldUpdate = false
        let updatedTransaction = { ...transaction }
        
        if (type === 'status' && transaction.status === deletedTypeName) {
          // Remove memo from transactions that used this status
          if (transaction.memo) {
            updatedTransaction.memo = undefined
            shouldUpdate = true
          }
        } else if (type === 'event' && transaction.eventType === deletedTypeName) {
          // Remove memo from transactions that used this event type
          if (transaction.memo) {
            updatedTransaction.memo = undefined
            shouldUpdate = true
          }
        }
        
        if (shouldUpdate) {
          transactionsToUpdate.push(updatedTransaction)
        }
      }
      
      // Update transactions in batches to avoid memory issues
      const batchSize = 50
      for (let i = 0; i < transactionsToUpdate.length; i += batchSize) {
        const batch = transactionsToUpdate.slice(i, i + batchSize)
        
        for (const transaction of batch) {
          await db.put('transactions', transaction)
        }
      }
      
      // Update reactive state
      transactions.value = transactions.value.map(t => {
        const updated = transactionsToUpdate.find(ut => ut.id === t.id)
        return updated || t
      })
      
      console.log(`Cleaned up memo data from ${transactionsToUpdate.length} transactions`)
    } catch (error) {
      console.error('Error cleaning up memo data:', error)
      throw error
    }
  }

  // Data Validation & Cleanup Functions
  const validateTransactionData = (): { orphanedStatuses: string[], orphanedEvents: string[] } => {
    const validStatuses = new Set([
      'IN CLASS',
      'RESTROOM', 
      'OFFICE',
      'COUNSELOR',
      'LIBRARY',
      'TEACHER VISIT',
      ...customStatusTypes.value.map(s => s.name)
    ])
    
    const validEvents = new Set([
      'PHONE OUT IN CLASS',
      'BAD LANGUAGE', 
      'OUT OF ASSIGNED SEAT',
      'HORSE PLAY',
      ...customTeacherEventTypes.value.map(e => e.name)
    ])
    
    const orphanedStatuses: string[] = []
    const orphanedEvents: string[] = []
    
    transactions.value.forEach(transaction => {
      if (!validStatuses.has(transaction.status)) {
        orphanedStatuses.push(transaction.status)
      }
      if (transaction.eventType && !validEvents.has(transaction.eventType)) {
        orphanedEvents.push(transaction.eventType)
      }
    })
    
    return {
      orphanedStatuses: [...new Set(orphanedStatuses)],
      orphanedEvents: [...new Set(orphanedEvents)]
    }
  }

  const cleanupOrphanedTransactions = async (options: {
    orphanedStatusAction: 'delete' | 'migrate' | 'keep'
    orphanedEventAction: 'delete' | 'migrate' | 'keep'
    migrationStatus?: string
    migrationEvent?: string
  }): Promise<MigrationResult> => {
    if (!db) throw new Error('Database not initialized')
    
    // Create snapshot before cleanup
    const snapshot = await createDatabaseSnapshot(
      students.value,
      classes.value,
      transactions.value,
      styleSettings.value,
      customStatusTypes.value,
      customTeacherEventTypes.value,
      `Cleanup orphaned transactions: ${options.orphanedStatusAction}/${options.orphanedEventAction}`
    )
    
    // Save snapshot
    SnapshotManager.saveSnapshot(snapshot)
    
    // Create migration operation
    const operation = createMigrationOperation(
      'data_cleanup',
      `Cleanup orphaned transactions: ${options.orphanedStatusAction}/${options.orphanedEventAction}`,
      snapshot.id,
      { 
        oldValue: 'orphaned_data',
        newValue: options.migrationStatus || options.migrationEvent || 'cleaned'
      }
    )
    
    // Perform safe cleanup
    const result = await performSafeMigration(
      async () => {
        const validStatuses = new Set([
          'IN CLASS',
          'RESTROOM', 
          'OFFICE',
          'COUNSELOR',
          'LIBRARY',
          'TEACHER VISIT',
          ...customStatusTypes.value.map(s => s.name)
        ])
        
        const validEvents = new Set([
          'PHONE OUT IN CLASS',
          'BAD LANGUAGE', 
          'OUT OF ASSIGNED SEAT',
          'HORSE PLAY',
          ...customTeacherEventTypes.value.map(e => e.name)
        ])
        
        let affected = 0
        
        // Process transactions in batches to avoid memory issues
        const batchSize = 100
        for (let i = 0; i < transactions.value.length; i += batchSize) {
          const batch = transactions.value.slice(i, i + batchSize)
          
          for (const transaction of batch) {
            let needsUpdate = false
            let updatedTransaction = { ...transaction }
            
            // Handle orphaned status
                    if (!validStatuses.has(transaction.status)) {
          if (options.orphanedStatusAction === 'delete') {
            if (db && transaction.id) {
              await db.delete('transactions', transaction.id)
            }
            affected++
            continue
              } else if (options.orphanedStatusAction === 'migrate' && options.migrationStatus) {
                updatedTransaction.status = options.migrationStatus as StudentStatus
                needsUpdate = true
                affected++
              }
            }
            
            // Handle orphaned event type
            if (transaction.eventType && !validEvents.has(transaction.eventType)) {
              if (options.orphanedEventAction === 'delete') {
                updatedTransaction.eventType = undefined as any
                needsUpdate = true
                affected++
              } else if (options.orphanedEventAction === 'migrate' && options.migrationEvent) {
                updatedTransaction.eventType = options.migrationEvent as TeacherEventType
                needsUpdate = true
                affected++
              }
            }
            
            // Update transaction if needed
            if (needsUpdate && db) {
              await db.put('transactions', updatedTransaction)
              const index = transactions.value.findIndex(t => t.id === transaction.id)
              if (index !== -1) {
                transactions.value[index] = updatedTransaction
              }
            }
          }
        }
        
        // Sync changes to server
        await syncToServer()
        
        return affected
      },
      snapshot,
      db,
      operation
    )
    
    return result
  }

  const performDataMigration = async (migrationType: 'status' | 'event', oldValue: string, newValue: string): Promise<MigrationResult> => {
    if (!db) throw new Error('Database not initialized')
    
    // Create snapshot before migration
    const snapshot = await createDatabaseSnapshot(
      students.value,
      classes.value,
      transactions.value,
      styleSettings.value,
      customStatusTypes.value,
      customTeacherEventTypes.value,
      `Migration: ${migrationType} from "${oldValue}" to "${newValue}"`
    )
    
    // Save snapshot
    SnapshotManager.saveSnapshot(snapshot)
    
    // Create migration operation
    const operation = createMigrationOperation(
      migrationType === 'status' ? 'status_migration' : 'event_migration',
      `Migrate ${migrationType} from "${oldValue}" to "${newValue}"`,
      snapshot.id,
      { oldValue, newValue }
    )
    
    // Perform safe migration
    const result = await performSafeMigration(
      async () => {
        let migrated = 0
        
        // Update all transactions with the old value
        const transactionsToUpdate = transactions.value.filter(t => 
          migrationType === 'status' ? t.status === oldValue : t.eventType === oldValue
        )
        
        for (const transaction of transactionsToUpdate) {
          const updatedTransaction = { ...transaction }
          
          if (migrationType === 'status') {
            updatedTransaction.status = newValue as StudentStatus
          } else {
            updatedTransaction.eventType = newValue as TeacherEventType
          }
          
          if (db) {
            await db.put('transactions', updatedTransaction)
          }
          const index = transactions.value.findIndex(t => t.id === transaction.id)
          if (index !== -1) {
            transactions.value[index] = updatedTransaction
          }
          migrated++
        }
        
        // Sync changes to server
        await syncToServer()
        
        return migrated
      },
      snapshot,
      db,
      operation
    )
    
    return result
  }

  const exportDatabaseBackup = async (): Promise<string> => {
    const backup = {
      students: students.value,
      classes: classes.value,
      transactions: transactions.value,
      styleSettings: styleSettings.value,
      customStatusTypes: customStatusTypes.value,
      customTeacherEventTypes: customTeacherEventTypes.value,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }
    
    return JSON.stringify(backup, null, 2)
  }

  const importDatabaseBackup = async (backupData: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized')
    
    try {
      const backup = JSON.parse(backupData)
      
      // Clear existing data
      await db.clear('students')
      await db.clear('classes')
      await db.clear('transactions')
      await db.clear('styleSettings')
      await db.clear('customStatusTypes')
      await db.clear('customTeacherEventTypes')
      
      // Import data
      for (const student of backup.students || []) {
        await db.add('students', {
          ...student,
          classes: typeof student.classes === 'string' ? JSON.parse(student.classes) : student.classes
        })
      }
      
      for (const classData of backup.classes || []) {
        await db.add('classes', classData)
      }
      
      for (const transaction of backup.transactions || []) {
        await db.add('transactions', transaction)
      }
      
      if (backup.styleSettings) {
        await db.add('styleSettings', backup.styleSettings)
      }
      
      for (const statusType of backup.customStatusTypes || []) {
        await db.add('customStatusTypes', statusType)
      }
      
      for (const eventType of backup.customTeacherEventTypes || []) {
        await db.add('customTeacherEventTypes', eventType)
      }
      
      // Reload data
      await loadData()
      
      // Sync to server
      await syncToServer()
      
    } catch (error) {
      console.error('Failed to import backup:', error)
      throw new Error('Invalid backup data format')
    }
  }

  const clearAllData = async (): Promise<void> => {
    if (!db) throw new Error('Database not initialized')
    
    // Create snapshot before clearing
    const snapshot = await createDatabaseSnapshot(
      students.value,
      classes.value,
      transactions.value,
      styleSettings.value,
      customStatusTypes.value,
      customTeacherEventTypes.value,
      'Before clearing all data'
    )
    
    // Save snapshot
    SnapshotManager.saveSnapshot(snapshot)
    
    // Clear all data stores
    await db.clear('students')
    await db.clear('classes')
    await db.clear('transactions')
    await db.clear('styleSettings')
    await db.clear('customStatusTypes')
    await db.clear('customTeacherEventTypes')
    
    // Reset reactive state
    students.value = []
    classes.value = []
    transactions.value = []
    styleSettings.value = null
    customStatusTypes.value = []
    customTeacherEventTypes.value = []
    currentClass.value = null
    
    // Initialize default style settings
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
    await db.add('styleSettings', defaultSettings)
    
    // Sync to server
    await syncToServer()
  }

  // Snapshot management functions
  const createSnapshot = async (description: string): Promise<string> => {
    const snapshot = await createDatabaseSnapshot(
      students.value,
      classes.value,
      transactions.value,
      styleSettings.value,
      customStatusTypes.value,
      customTeacherEventTypes.value,
      description
    )
    
    SnapshotManager.saveSnapshot(snapshot)
    return snapshot.id
  }

  const restoreFromSnapshot = async (snapshotId: string): Promise<boolean> => {
    if (!db) throw new Error('Database not initialized')
    
    const snapshot = SnapshotManager.getSnapshot(snapshotId)
    if (!snapshot) {
      throw new Error('Snapshot not found')
    }
    
    const success = await restoreFromSnapshotUtil(snapshot, db!)
    
    if (success) {
      // Reload data from database
      await loadData()
      
      // Sync to server
      await syncToServer()
    }
    
    return success
  }

  const getAllSnapshots = (): DatabaseSnapshot[] => {
    return SnapshotManager.getAllSnapshots()
  }

  const deleteSnapshot = (snapshotId: string): boolean => {
    return SnapshotManager.deleteSnapshot(snapshotId)
  }

  return {
    // State
    currentMode,
    currentClass,
    students,
    classes,
    transactions,
    styleSettings,
    customStatusTypes,
    customTeacherEventTypes,
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
    ensureDBReady,
    deleteDatabase,
    restoreDataToNewDatabase,
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
    switchMode,
    
    // Custom type management
    addCustomStatusType,
    removeCustomStatusType,
    updateCustomStatusType,
    addCustomTeacherEventType,
    removeCustomTeacherEventType,
    updateCustomTeacherEventType,
    
    // Data validation & cleanup
    validateTransactionData,
    cleanupOrphanedTransactions,
    performDataMigration,
    exportDatabaseBackup,
    importDatabaseBackup,
    clearAllData,
    
    // Memo functionality
    requiresMemo,
    getMemoColumnName,
    cleanupMemoDataFromTransactions,
    
    // Snapshot management
    createSnapshot,
    restoreFromSnapshot,
    getAllSnapshots,
    deleteSnapshot
  }
})
