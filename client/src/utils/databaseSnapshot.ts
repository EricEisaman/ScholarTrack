import type { 
  DatabaseSnapshot, 
  MigrationOperation, 
  MigrationResult,
  Student,
  Class,
  Transaction,
  StyleSettings,
  CustomStatusType,
  CustomTeacherEventType
} from '../types'

/**
 * Generates a checksum for data integrity verification
 */
export const generateChecksum = (data: string): string => {
  let hash = 0
  if (data.length === 0) return hash.toString()
  
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  return hash.toString()
}

/**
 * Creates a database snapshot
 */
export const createDatabaseSnapshot = async (
  students: Student[],
  classes: Class[],
  transactions: Transaction[],
  styleSettings: StyleSettings | null,
  customStatusTypes: CustomStatusType[],
  customTeacherEventTypes: CustomTeacherEventType[],
  description: string
): Promise<DatabaseSnapshot> => {
  const snapshotData = {
    students,
    classes,
    transactions,
    styleSettings,
    customStatusTypes,
    customTeacherEventTypes
  }
  
  const dataString = JSON.stringify(snapshotData)
  const checksum = generateChecksum(dataString)
  
  const snapshot: DatabaseSnapshot = {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    description,
    data: snapshotData,
    version: '1.0',
    checksum
  }
  
  return snapshot
}

/**
 * Verifies snapshot integrity
 */
export const verifySnapshotIntegrity = (snapshot: DatabaseSnapshot): boolean => {
  const dataString = JSON.stringify(snapshot.data)
  const calculatedChecksum = generateChecksum(dataString)
  return calculatedChecksum === snapshot.checksum
}

/**
 * Restores database from snapshot
 */
export const restoreFromSnapshot = async (
  snapshot: DatabaseSnapshot,
  db: any
): Promise<boolean> => {
  try {
    // Verify snapshot integrity first
    if (!verifySnapshotIntegrity(snapshot)) {
      throw new Error('Snapshot integrity check failed')
    }
    
    // Clear existing data
    await db.clear('students')
    await db.clear('classes')
    await db.clear('transactions')
    await db.clear('styleSettings')
    await db.clear('customStatusTypes')
    await db.clear('customTeacherEventTypes')
    
    // Restore data
    for (const student of snapshot.data.students) {
      await db.add('students', {
        ...student,
        classes: typeof student.classes === 'string' ? JSON.parse(student.classes) : student.classes
      })
    }
    
    for (const classData of snapshot.data.classes) {
      await db.add('classes', classData)
    }
    
    for (const transaction of snapshot.data.transactions) {
      await db.add('transactions', transaction)
    }
    
    if (snapshot.data.styleSettings) {
      await db.add('styleSettings', snapshot.data.styleSettings)
    }
    
    for (const statusType of snapshot.data.customStatusTypes) {
      await db.add('customStatusTypes', statusType)
    }
    
    for (const eventType of snapshot.data.customTeacherEventTypes) {
      await db.add('customTeacherEventTypes', eventType)
    }
    
    return true
  } catch (error) {
    console.error('Failed to restore from snapshot:', error)
    return false
  }
}

/**
 * Creates a migration operation record
 */
export const createMigrationOperation = (
  type: MigrationOperation['type'],
  description: string,
  snapshotId: string,
  details: MigrationOperation['details'] = {}
): MigrationOperation => {
  return {
    id: crypto.randomUUID(),
    type,
    description,
    timestamp: new Date().toISOString(),
    status: 'pending',
    snapshotId,
    details
  }
}

/**
 * Performs a safe migration with automatic rollback
 */
export const performSafeMigration = async (
  migrationFn: () => Promise<number>,
  snapshot: DatabaseSnapshot,
  db: any,
  operation: MigrationOperation
): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: false,
    operationId: operation.id,
    affectedRecords: 0,
    snapshotId: snapshot.id
  }
  
  try {
    // Update operation status to in_progress
    operation.status = 'in_progress'
    
    // Perform the migration
    const affectedRecords = await migrationFn()
    
    // Verify database integrity after migration
    const integrityCheck = await verifyDatabaseIntegrity(db)
    if (!integrityCheck.isValid) {
      throw new Error(`Database integrity check failed after migration: ${integrityCheck.errors.join(', ')}`)
    }
    
    // Update operation status to completed
    operation.status = 'completed'
    operation.details.affectedRecords = affectedRecords
    
    result.success = true
    result.affectedRecords = affectedRecords
    
    return result
    
  } catch (error) {
    console.error('Migration failed, attempting rollback:', error)
    
    // Update operation status to failed
    operation.status = 'failed'
    operation.details.error = error instanceof Error ? error.message : 'Unknown error'
    
    // Attempt rollback
    try {
      const rollbackSuccess = await restoreFromSnapshot(snapshot, db)
      
      if (rollbackSuccess) {
        operation.status = 'rolled_back'
        result.rollbackPerformed = true
        result.error = `Migration failed and was rolled back: ${error instanceof Error ? error.message : 'Unknown error'}`
      } else {
        result.error = `Migration failed and rollback also failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError)
      result.error = `Migration failed and rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
    
    return result
  }
}

/**
 * Verifies database integrity
 */
export const verifyDatabaseIntegrity = async (db: any): Promise<{ isValid: boolean; errors: string[] }> => {
  const errors: string[] = []
  
  try {
    // Check if all required tables exist
    const tableNames = ['students', 'classes', 'transactions', 'styleSettings', 'customStatusTypes', 'customTeacherEventTypes']
    
    for (const tableName of tableNames) {
      try {
        await db.getAll(tableName)
      } catch (error) {
        errors.push(`Table ${tableName} is not accessible`)
      }
    }
    
    // Check for orphaned references
    const students = await db.getAll('students')
    const transactions = await db.getAll('transactions')
    const customStatusTypes = await db.getAll('customStatusTypes')
    const customTeacherEventTypes = await db.getAll('customTeacherEventTypes')
    
    // Check for orphaned transactions (students that don't exist)
    const studentCodes = new Set(students.map((s: any) => s.code))
    const orphanedTransactions = transactions.filter((t: any) => 
      t.studentCode && !studentCodes.has(t.studentCode)
    )
    
    if (orphanedTransactions.length > 0) {
      errors.push(`Found ${orphanedTransactions.length} transactions with orphaned student references`)
    }
    
    // Check for orphaned status types
    const validStatuses = new Set([
      'IN CLASS', 'RESTROOM', 'OFFICE', 'COUNSELOR', 'LIBRARY', 'TEACHER VISIT',
      ...customStatusTypes.map((s: any) => s.name)
    ])
    
    const invalidStatusTransactions = transactions.filter((t: any) => 
      !validStatuses.has(t.status)
    )
    
    if (invalidStatusTransactions.length > 0) {
      errors.push(`Found ${invalidStatusTransactions.length} transactions with invalid status types`)
    }
    
    // Check for orphaned event types
    const validEvents = new Set([
      'PHONE OUT IN CLASS', 'BAD LANGUAGE', 'OUT OF ASSIGNED SEAT', 'HORSE PLAY',
      ...customTeacherEventTypes.map((e: any) => e.name)
    ])
    
    const invalidEventTransactions = transactions.filter((t: any) => 
      t.eventType && !validEvents.has(t.eventType)
    )
    
    if (invalidEventTransactions.length > 0) {
      errors.push(`Found ${invalidEventTransactions.length} transactions with invalid event types`)
    }
    
  } catch (error) {
    errors.push(`Database integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Manages snapshot storage (localStorage for now, could be extended to IndexedDB)
 */
export class SnapshotManager {
  private static readonly SNAPSHOT_PREFIX = 'scholartrack_snapshot_'
  private static readonly MAX_SNAPSHOTS = 10
  
  static saveSnapshot(snapshot: DatabaseSnapshot): void {
    try {
      const key = `${this.SNAPSHOT_PREFIX}${snapshot.id}`
      localStorage.setItem(key, JSON.stringify(snapshot))
      
      // Clean up old snapshots
      this.cleanupOldSnapshots()
    } catch (error) {
      console.error('Failed to save snapshot:', error)
    }
  }
  
  static getSnapshot(snapshotId: string): DatabaseSnapshot | null {
    try {
      const key = `${this.SNAPSHOT_PREFIX}${snapshotId}`
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get snapshot:', error)
      return null
    }
  }
  
  static getAllSnapshots(): DatabaseSnapshot[] {
    const snapshots: DatabaseSnapshot[] = []
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.SNAPSHOT_PREFIX)) {
          const data = localStorage.getItem(key)
          if (data) {
            const snapshot = JSON.parse(data)
            snapshots.push(snapshot)
          }
        }
      }
      
      // Sort by timestamp (newest first)
      return snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    } catch (error) {
      console.error('Failed to get all snapshots:', error)
      return []
    }
  }
  
  static deleteSnapshot(snapshotId: string): boolean {
    try {
      const key = `${this.SNAPSHOT_PREFIX}${snapshotId}`
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error('Failed to delete snapshot:', error)
      return false
    }
  }
  
  private static cleanupOldSnapshots(): void {
    try {
      const snapshots = this.getAllSnapshots()
      
      if (snapshots.length > this.MAX_SNAPSHOTS) {
        const snapshotsToDelete = snapshots.slice(this.MAX_SNAPSHOTS)
        
        for (const snapshot of snapshotsToDelete) {
          this.deleteSnapshot(snapshot.id)
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old snapshots:', error)
    }
  }
}
