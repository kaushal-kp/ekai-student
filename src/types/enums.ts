export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  HOLIDAY = 'holiday',
  LEAVE = 'leave',
}

export enum LeaveStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum LeaveType {
  MEDICAL = 'medical',
  PERSONAL = 'personal',
  FAMILY_EMERGENCY = 'family_emergency',
  EVENT_PARTICIPATION = 'event_participation',
}

export enum ExamType {
  UNIT_TEST = 'unit_test',
  HALF_YEARLY = 'half_yearly',
  ANNUAL = 'annual',
  PERIODIC = 'periodic',
}

export enum Grade {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
  D = 'D',
  E1 = 'E1',
  E2 = 'E2',
  F = 'F',
}

export enum ConsentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum ConsentType {
  EMPLOYER = 'employer',
  COLLEGE = 'college',
  SCHOLARSHIP = 'scholarship',
  GOVERNMENT = 'government',
  ANALYTICS = 'analytics',
}

export enum APAARStatus {
  VERIFIED = 'verified',
  PENDING = 'pending',
  UNLINKED = 'unlinked',
}

export enum NotificationType {
  CIRCULAR = 'circular',
  LEAVE_APPROVED = 'leave_approved',
  LEAVE_REJECTED = 'leave_rejected',
  EXAM_RESULT = 'exam_result',
  ACHIEVEMENT = 'achievement',
  ATTENDANCE_WARNING = 'attendance_warning',
  READINESS_UPDATE = 'readiness_update',
  PROFILE_VIEWED = 'profile_viewed',
  MESSAGE = 'message',
}

export enum ReadinessLevel {
  READY = 'ready',
  NEEDS_PREP = 'needs_prep',
  AT_RISK = 'at_risk',
  NOT_STARTED = 'not_started',
}

export enum SubjectStatus {
  ON_TRACK = 'on_track',
  NEEDS_ATTENTION = 'needs_attention',
  AT_RISK = 'at_risk',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
}
