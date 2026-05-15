import { AttendanceStatus, LeaveStatus, LeaveType, ExamType, Grade, ConsentStatus, ConsentType, APAARStatus, NotificationType, ReadinessLevel, SubjectStatus } from './enums';

export interface Student {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobile: string;
  dob: string;
  gender: 'male' | 'female' | 'other';
  avatarUrl?: string;
  class: string;
  section: string;
  rollNumber: string;
  schoolId: string;
  schoolName: string;
  schoolLogo?: string;
  board: 'CBSE' | 'ICSE' | 'State';
  udiseCode: string;
  apaarId: string;
  apaarStatus: APAARStatus;
  isMinor: boolean;
  parentConsentGiven: boolean;
  enrollmentDate: string;
  academicYear: string;
  interests: string[];
  careerGoal?: string;
  dreamCollege?: string;
  language: 'en' | 'hi';
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  teacherName: string;
  teacherEmail?: string;
  lastScore?: number;
  averageScore?: number;
  syllabusProgress: number;
  status: SubjectStatus;
  attendancePercent: number;
}

export interface ExamResult {
  id: string;
  subjectId: string;
  subjectName: string;
  examName: string;
  examType: ExamType;
  date: string;
  marksObtained: number;
  maxMarks: number;
  percentage: number;
  grade: Grade;
  classRank: number;
  classAverage: number;
  teacherRemarks?: string;
}

export interface UpcomingExam {
  id: string;
  subjectId: string;
  subjectName: string;
  examType: ExamType;
  date: string;
  time: string;
  venue: string;
  syllabusChapters: string[];
  readinessLevel: ReadinessLevel;
  readinessScore: number;
  hasReminder: boolean;
}

export interface AttendanceDay {
  date: string;
  status: AttendanceStatus;
  periods?: { subject: string; status: AttendanceStatus }[];
}

export interface MonthlyAttendance {
  month: string;
  workingDays: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}

export interface LeaveBalance {
  type: LeaveType;
  label: string;
  allocated: number;
  used: number;
  remaining: number;
}

export interface LeaveRequest {
  id: string;
  type: LeaveType;
  fromDate: string;
  toDate: string;
  duration: number;
  reason: string;
  documentUrl?: string;
  notifyTeacher: boolean;
  status: LeaveStatus;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'academic' | 'improvement' | 'attendance' | 'milestone' | 'participation';
  icon: string;
  color: string;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  progressMax?: number;
  progressLabel?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface ShareLink {
  id: string;
  name: string;
  purpose: string;
  url: string;
  permissions: SharePermissions;
  createdAt: string;
  expiresAt?: string;
  views: number;
  isPasswordProtected: boolean;
  isActive: boolean;
}

export interface SharePermissions {
  basicInfo: boolean;
  attendanceSummary: boolean;
  marksDetails: 'full' | 'summary' | 'hidden';
  achievements: boolean;
  coCurricular: boolean;
  apaarId: boolean;
  fullReportCards: boolean;
}

export interface ConsentLog {
  id: string;
  organization: string;
  purpose: string;
  type: ConsentType;
  dataFields: string[];
  consentGivenAt: string;
  expiresAt?: string;
  status: ConsentStatus;
  canRevoke: boolean;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
  deepLink?: string;
  icon?: string;
}

export interface InboxThread {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'teacher' | 'system';
  senderAvatar?: string;
  subject: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: InboxMessage[];
}

export interface InboxMessage {
  id: string;
  content: string;
  type: 'text' | 'attachment' | 'circular' | 'alert' | 'action';
  sentAt: string;
  isRead: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentSize?: number;
  actionLabel?: string;
  actionUrl?: string;
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface LoginHistory {
  id: string;
  timestamp: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
  ipAddress?: string;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  field: string;
  matchPercent: number;
  salaryRangeMin: number;
  salaryRangeMax: number;
  keySkills: string[];
  educationPath: string[];
  topColleges: string[];
  requiredSubjects: string[];
  entranceExams: string[];
  description: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  duration: number;
  date: string;
  startTime: string;
  hasReminder: boolean;
  status: 'planned' | 'completed' | 'skipped' | 'rescheduled';
  completedAt?: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  category: 'merit' | 'need' | 'category' | 'sports';
  eligibilityCriteria: string[];
  deadline: string;
  applicationUrl?: string;
  isEligible?: boolean;
  eligibilityStatus?: 'eligible' | 'partial' | 'ineligible';
}

export interface Internship {
  id: string;
  company: string;
  role: string;
  duration: string;
  stipend: number;
  mode: 'remote' | 'onsite' | 'hybrid';
  deadline: string;
  skillsRequired: string[];
  isVerifiedEmployer: boolean;
}

export interface CoCurricularActivity {
  id: string;
  name: string;
  category: string;
  description: string;
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  level: 'school' | 'district' | 'state' | 'national';
  coach?: string;
  isVerified: boolean;
  certificates: Certificate[];
  performanceNotes?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  fileUrl: string;
  isVerified: boolean;
}

export interface ReadinessScore {
  overall: number;
  academicPerformance: number;
  attendance: number;
  syllabusConverage: number;
  studyConsistency: number;
  pastExamPerformance: number;
  subjectWise: { subjectId: string; subjectName: string; score: number; level: ReadinessLevel }[];
  suggestions: ReadinessSuggestion[];
  history: { month: string; score: number }[];
  aiExplanation: string;
}

export interface ReadinessSuggestion {
  id: string;
  text: string;
  priority: 'high' | 'medium' | 'low';
  impact: number;
  subjectId?: string;
}
