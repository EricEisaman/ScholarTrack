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
  studentIdentifier: string // Full identifier: "AB-emoji name"
  status: StudentStatus
  timestamp: string
  className: string
  eventType?: TeacherEventType
}

export type StudentStatus = 
  | 'IN CLASS'
  | 'RESTROOM'
  | 'OFFICE'
  | 'COUNSELOR'
  | 'LIBRARY'
  | 'TEACHER VISIT'

export type TeacherEventType = 
  | 'PHONE OUT IN CLASS'
  | 'BAD LANGUAGE'
  | 'OUT OF ASSIGNED SEAT'
  | 'HORSE PLAY'

export type AppMode = 
  | 'STANDARD'
  | 'MANAGE CLASSES'
  | 'MANAGE STUDENTS'
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
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  quaternaryColor: string
  logoImage: string // base64 string
  schoolName: string
  updatedAt: string
}
