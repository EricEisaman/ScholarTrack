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
  status: StudentStatus
  timestamp: string
  className: string
  eventType?: TeacherEventType
}

export type StudentStatus = 
  | 'DEFAULT'
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
  | 'ADD CLASS'
  | 'ADD STUDENT'
  | 'EDIT STUDENT'
  | 'REMOVE STUDENT'
  | 'REPORTS'

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
