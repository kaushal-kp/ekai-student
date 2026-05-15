import { Student, Subject, ExamResult, UpcomingExam, AttendanceDay, MonthlyAttendance, LeaveBalance, LeaveRequest, Achievement, ShareLink, ConsentLog, Notification, InboxThread, Session, LoginHistory, CareerRecommendation, StudySession, Scholarship, Internship, CoCurricularActivity, ReadinessScore } from './models';
import { LeaveType } from './enums';

// Generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth
export interface LoginRequest { mobile: string }
export interface OTPRequest { mobile: string; otp: string; sessionId: string }
export interface AuthResponse {
  accessToken: string;
  student: Student;
  sessionId: string;
  isNewUser: boolean;
}
export interface RefreshResponse { accessToken: string }

// Dashboard
export interface DashboardData {
  greeting: string;
  stats: {
    attendancePercent: number;
    attendanceTrend: number;
    nextExam: { subject: string; daysLeft: number } | null;
    studyStreak: number;
    classRank: number;
    totalStudents: number;
  };
  readinessScore: number;
  upcomingExams: UpcomingExam[];
  recentMarks: ExamResult[];
  todayTimetable: TimetableEntry[];
  announcements: Announcement[];
  recentAchievements: Achievement[];
}

export interface TimetableEntry {
  period: number;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
  room: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

// Profile
export interface UpdateProfileRequest {
  dob?: string;
  gender?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  interests?: string[];
  careerGoal?: string;
  dreamCollege?: string;
  language?: 'en' | 'hi';
}

// Leave
export interface CreateLeaveRequest {
  type: LeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  documentUrl?: string;
  notifyTeacher: boolean;
}

// Share links
export interface CreateShareLinkRequest {
  name: string;
  purpose: string;
  permissions: Record<string, boolean | string>;
  expiresIn?: number;
  password?: string;
}

// Security
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface Setup2FARequest {
  mobile: string;
  otp: string;
}

// Data rights
export interface DataDownloadRequest { format: 'json' | 'pdf' }
export interface DataCorrectionRequest {
  fieldName: string;
  currentValue: string;
  correctValue: string;
  reason: string;
  evidenceUrl?: string;
}
export interface DataDeletionRequest { password: string; confirmation: string }

// Opportunities
export interface OpportunitiesResponse {
  scholarships: Scholarship[];
  internships: Internship[];
  events: CampusEvent[];
}

export interface CampusEvent {
  id: string;
  name: string;
  type: string;
  date: string;
  venue: string;
  organizer: string;
  seatsAvailable: number;
  totalSeats: number;
  isRegistered: boolean;
}
