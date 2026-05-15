export const APP_NAME = 'EKAI Student Hub';
export const APP_VERSION = '1.0.0';

export const API_BASE_URL = '/api/v1';
export const TOKEN_KEY = 'ekai_session';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOGIN_LOCKOUT_MINUTES = 15;
export const OTP_EXPIRY_SECONDS = 300;
export const OTP_RESEND_SECONDS = 60;
export const SESSION_TIMEOUT_MINUTES = 30;
export const CLIPBOARD_CLEAR_SECONDS = 60;

export const MAX_FILE_SIZE_MB = 5;
export const MAX_AVATAR_SIZE_MB = 2;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

export const MIN_ATTENDANCE_PERCENT = 75;
export const STALE_TIME_ACADEMIC = 5 * 60 * 1000; // 5 minutes
export const STALE_TIME_NOTIFICATIONS = 30 * 1000; // 30 seconds

export const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'Hindi',
  'Social Science',
  'Computer Science',
  'Physical Education',
];

export const CAREER_PATHS = [
  'Software Engineer',
  'Doctor / Medical Professional',
  'Data Scientist',
  'Civil Services (IAS/IPS)',
  'Chartered Accountant',
  'Lawyer',
  'Architect',
  'Teacher / Professor',
  'Entrepreneur',
  'Fashion Designer',
  'Journalist',
  'Nurse / Healthcare',
  'Banking & Finance',
  'Army / Defense',
  'Artist / Musician',
  'Film & Media',
  'Social Worker',
  'Pilot / Aviation',
  'Research Scientist',
  'Sports Professional',
];

export const INTERESTS = [
  'Science',
  'Art',
  'Sports',
  'Music',
  'Technology',
  'Literature',
  'Commerce',
  'Design',
  'Law',
  'Medicine',
  'Gaming',
  'Photography',
  'Travel',
  'Cooking',
  'Environment',
];

export const GRADE_COLORS: Record<string, string> = {
  A1: '#10B981',
  A2: '#34D399',
  B1: '#6C63FF',
  B2: '#818CF8',
  C1: '#F59E0B',
  C2: '#FCD34D',
  D: '#F97316',
  E1: '#EF4444',
  E2: '#DC2626',
  F: '#7F1D1D',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ONBOARDING: '/onboarding',
  DASHBOARD: '/dashboard',
  ACADEMICS: '/academics',
  ACADEMICS_SUBJECT: '/academics/:subjectId',
  PERFORMANCE: '/performance',
  STUDY_PLANNER: '/study-planner',
  EXAMS: '/exams',
  REPORT_CARD: '/report-card',
  READINESS_SCORE: '/readiness-score',
  ATTENDANCE: '/attendance',
  LEAVE_REQUEST: '/leave/request',
  LEAVE_STATUS: '/leave/status',
  PROFILE: '/profile',
  APAAR: '/apaar',
  SHARING: '/sharing',
  ACHIEVEMENTS: '/achievements',
  CO_CURRICULAR: '/co-curricular',
  CAREER: '/career',
  OPPORTUNITIES: '/opportunities',
  INBOX: '/inbox',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  SETTINGS_SECURITY: '/settings/security',
  SETTINGS_PRIVACY: '/settings/privacy',
  CONSENT: '/consent',
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/403',
};
