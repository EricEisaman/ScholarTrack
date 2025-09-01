export interface Student {
  id: string
  label: string
  code: string
  emoji: string
  classes: string[]
  createdAt: string
}

export interface Class {
  id: string
  name: string
  createdAt: string
}

export interface Transaction {
  id?: number
  studentLabel: string
  studentCode: string // Unique student code for precise identification
  studentIdentifier: string // Full identifier: "AB-emoji name"
  status: StudentStatus
  timestamp: string
  className: string
  eventType?: TeacherEventType
  memo?: string // Optional memo for status/event types that require it
}

export type StudentStatus =
  | 'IN CLASS'
  | 'RESTROOM'
  | 'OFFICE'
  | 'COUNSELOR'
  | 'LIBRARY'
  | 'TEACHER VISIT'
  | string // Allow custom status types

export type TeacherEventType =
  | 'PHONE VIOLATION'
  | 'BAD LANGUAGE'
  | 'SEATING VIOLATION'
  | 'HORSE PLAY'
  | string // Allow custom teacher event types

export type AppMode =
  | 'STANDARD'
  | 'MANAGE CLASSES'
  | 'MANAGE STUDENTS'
  | 'MANAGE TRANSACTIONS'
  | 'REPORTS'
  | 'STYLE SETTINGS'
  | 'RESPONSIVE SHOWCASE'
  | 'NETWORK SETTINGS'

export type StatusColor = Record<StudentStatus, string>

export interface NewStudent {
  label: string
  code: string
  emoji: string
  classes: string[]
}

export interface ReportFilters {
  startDate: string
  endDate: string
  reportType: 'student' | 'teacher'
  className?: string
}

export interface StyleSettings {
  id: string
  designMode: 'smart' | 'advanced'
  colorScheme?: 'monochromatic' | 'adjacent' | 'triadic' | 'tetrad'
  baseColor?: string
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  quaternaryColor: string
  pageBackgroundColor: string
  logoImage: string // base64 string
  schoolName: string
  updatedAt: string
}

// Generic base interface for all custom types
export interface BaseCustomType {
  id: string
  name: string
  createdAt: string
}

export interface CustomStatusType extends BaseCustomType {
  color: string
  includeMemo: boolean // Whether this status type requires a memo
}

export interface CustomTeacherEventType extends BaseCustomType {
  includeMemo: boolean // Whether this event type requires a memo
}

// Validation interfaces
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface NameValidationOptions {
  minLength?: number
  maxLength?: number
  allowSpecialChars?: boolean
  allowNumbers?: boolean
  reservedNames?: string[]
  caseSensitive?: boolean
}

// Default validation options
export const DEFAULT_NAME_VALIDATION_OPTIONS: NameValidationOptions = {
  minLength: 2,
  maxLength: 50,
  allowSpecialChars: false,
  allowNumbers: true,
  reservedNames: [
    'IN CLASS',
    'RESTROOM',
    'OFFICE',
    'COUNSELOR',
    'LIBRARY',
    'TEACHER VISIT',
    'PHONE VIOLATION',
    'BAD LANGUAGE',
    'SEATING VIOLATION',
    'HORSE PLAY',
  ],
  caseSensitive: false,
};

// Database snapshot and migration types
export interface DatabaseSnapshot {
  id: string
  timestamp: string
  description: string
  data: {
    students: Student[]
    classes: Class[]
    transactions: Transaction[]
    styleSettings: StyleSettings | null
    customStatusTypes: CustomStatusType[]
    customTeacherEventTypes: CustomTeacherEventType[]
  }
  version: string
  checksum: string
}

export interface MigrationOperation {
  id: string
  type: 'status_migration' | 'event_migration' | 'data_cleanup' | 'type_deletion'
  description: string
  timestamp: string
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'rolled_back'
  snapshotId: string
  details: {
    oldValue?: string
    newValue?: string
    affectedRecords?: number
    error?: string
  }
}

export interface MigrationResult {
  success: boolean
  operationId: string
  affectedRecords: number
  error?: string
  rollbackPerformed?: boolean
  snapshotId?: string
}
