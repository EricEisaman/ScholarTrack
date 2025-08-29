import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAppStore } from '../appStore'
import type { StyleSettings } from '../../types'

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  add: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  close: vi.fn()
}

const mockTransaction = {
  store: {
    getAll: vi.fn(),
    add: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}

// Mock openDB
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue(mockDB)
}))

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    
    // Reset mock implementations
    mockDB.transaction.mockReturnValue(mockTransaction)
    mockTransaction.store.getAll.mockResolvedValue([])
    mockTransaction.store.add.mockResolvedValue(undefined)
    mockTransaction.store.put.mockResolvedValue(undefined)
    mockTransaction.store.delete.mockResolvedValue(undefined)
  })

  describe('Style Settings', () => {
    it('initializes with null style settings', () => {
      const store = useAppStore()
      expect(store.styleSettings).toBe(null)
    })

    it('loads existing style settings from database', async () => {
      const mockSettings: StyleSettings = {
        id: 'default',
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        tertiaryColor: '#000000',
        quaternaryColor: '#121212',
        schoolName: 'ScholarTrack',
        logoImage: 'data:image/png;base64,test-logo',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      mockTransaction.store.getAll.mockResolvedValue([mockSettings])

      const store = useAppStore()
      await store.initDB()

      expect(store.styleSettings).toEqual(mockSettings)
    })

    it('updates style settings successfully', async () => {
      const store = useAppStore()
      await store.initDB()

      const newSettings = {
        primaryColor: '#123456',
        secondaryColor: '#654321',
        tertiaryColor: '#000000',
        quaternaryColor: '#121212',
        schoolName: 'ScholarTrack',
        logoImage: 'data:image/png;base64,new-logo'
      }

      await store.updateStyleSettings(newSettings)

      expect(mockTransaction.store.put).toHaveBeenCalledWith({
        id: 'default',
        ...newSettings,
        updatedAt: expect.any(String)
      })
    })

    it('returns current style settings', () => {
      const store = useAppStore()
      const mockSettings: StyleSettings = {
        id: 'default',
        primaryColor: '#FF0000',
        secondaryColor: '#00FF00',
        tertiaryColor: '#000000',
        quaternaryColor: '#121212',
        schoolName: 'ScholarTrack',
        logoImage: 'data:image/png;base64,test-logo',
        updatedAt: '2023-01-01T00:00:00Z'
      }

      store.styleSettings = mockSettings
      const result = store.getStyleSettings()

      expect(result).toEqual(mockSettings)
    })

    it('handles database errors gracefully', async () => {
      const store = useAppStore()
      
      // Mock database error
      mockTransaction.store.put.mockRejectedValue(new Error('Database error'))

      const newSettings = {
        primaryColor: '#123456',
        secondaryColor: '#654321',
        tertiaryColor: '#000000',
        quaternaryColor: '#121212',
        schoolName: 'ScholarTrack',
        logoImage: 'data:image/png;base64,test-logo'
      }

      // Should not throw error
      await expect(store.updateStyleSettings(newSettings)).resolves.toBeUndefined()
    })
  })

  describe('Mode Management', () => {
    it('changes mode with correct teacher code', () => {
      const store = useAppStore()
      
      store.tempCode = '456789' // Default teacher code
      store.changeMode('STYLE SETTINGS')

      expect(store.currentMode).toBe('STYLE SETTINGS')
      expect(store.showModeModal).toBe(false)
      expect(store.tempCode).toBe('')
    })

    it('does not change mode with incorrect teacher code', () => {
      const store = useAppStore()
      const originalMode = store.currentMode
      
      store.tempCode = 'wrong-code'
      store.changeMode('STYLE SETTINGS')

      expect(store.currentMode).toBe(originalMode)
      expect(store.showModeModal).toBe(true)
      expect(store.tempCode).toBe('wrong-code')
    })
  })

  describe('Class Management', () => {
    it('changes class with correct teacher code', () => {
      const store = useAppStore()
      
      // Add a test class
      store.classes = [
        { id: '1', name: 'Math Class', createdAt: '2023-01-01T00:00:00Z' }
      ]
      
      store.tempCode = '456789' // Default teacher code
      store.changeClass('Math Class')

      expect(store.currentClass?.name).toBe('Math Class')
      expect(store.showClassModal).toBe(false)
      expect(store.tempCode).toBe('')
    })

    it('does not change class with incorrect teacher code', () => {
      const store = useAppStore()
      const originalClass = store.currentClass
      
      store.classes = [
        { id: '1', name: 'Math Class', createdAt: '2023-01-01T00:00:00Z' }
      ]
      
      store.tempCode = 'wrong-code'
      store.changeClass('Math Class')

      expect(store.currentClass).toBe(originalClass)
      expect(store.showClassModal).toBe(true)
      expect(store.tempCode).toBe('wrong-code')
    })
  })

  describe('Student Management', () => {
    it('opens student modal correctly', () => {
      const store = useAppStore()
      const testStudent = {
        id: '1',
        label: 'AB',
        code: '1234',
        emoji: '👨‍🎓',
        classes: ['Math Class'],
        createdAt: '2023-01-01T00:00:00Z'
      }

      store.openStudentModal(testStudent)

      expect(store.selectedStudent).toEqual(testStudent)
      expect(store.showStudentModal).toBe(true)
    })

    it('closes student modal correctly', () => {
      const store = useAppStore()
      
      store.selectedStudent = { id: '1', label: 'AB', code: '1234', emoji: '👨‍🎓', classes: [], createdAt: '2023-01-01T00:00:00Z' }
      store.showStudentModal = true

      store.closeStudentModal()

      expect(store.selectedStudent).toBe(null)
      expect(store.showStudentModal).toBe(false)
    })
  })

  describe('Status Colors', () => {
    it('has correct status colors', () => {
      const store = useAppStore()
      
      expect(store.statusColors['IN CLASS']).toBe('#1976D2')
      expect(store.statusColors['RESTROOM']).toBe('#FF9800')
      expect(store.statusColors['OFFICE']).toBe('#F44336')
      expect(store.statusColors['COUNSELOR']).toBe('#9C27B0')
      expect(store.statusColors['LIBRARY']).toBe('#4CAF50')
      expect(store.statusColors['TEACHER VISIT']).toBe('#607D8B')
    })
  })

  describe('Teacher Events', () => {
    it('has correct teacher event types', () => {
      const store = useAppStore()
      
      expect(store.teacherEvents).toContain('PHONE OUT IN CLASS')
      expect(store.teacherEvents).toContain('BAD LANGUAGE')
      expect(store.teacherEvents).toContain('OUT OF ASSIGNED SEAT')
      expect(store.teacherEvents).toContain('HORSE PLAY')
    })
  })
})
