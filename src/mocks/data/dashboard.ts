import { DashboardData, TimetableEntry, Announcement } from '../../types/api';
import { mockUpcomingExams } from './exams';
import { mockExamResults } from './exams';
import { mockAchievements } from './achievements';

export const mockTodayTimetable: TimetableEntry[] = [
  { period: 1, subject: 'Mathematics', teacher: 'Mrs. Priya Sharma', startTime: '07:45', endTime: '08:30', room: 'Room 201' },
  { period: 2, subject: 'Science', teacher: 'Mr. Rakesh Kumar', startTime: '08:30', endTime: '09:15', room: 'Lab 1' },
  { period: 3, subject: 'English', teacher: 'Mrs. Anjali Verma', startTime: '09:15', endTime: '10:00', room: 'Room 301' },
  { period: 4, subject: 'Break', teacher: '', startTime: '10:00', endTime: '10:20', room: '' },
  { period: 5, subject: 'Hindi', teacher: 'Mr. Suresh Gupta', startTime: '10:20', endTime: '11:05', room: 'Room 105' },
  { period: 6, subject: 'Social Science', teacher: 'Mrs. Meena Pandey', startTime: '11:05', endTime: '11:50', room: 'Room 202' },
  { period: 7, subject: 'Lunch', teacher: '', startTime: '11:50', endTime: '12:30', room: '' },
  { period: 8, subject: 'Computer Science', teacher: 'Mr. Vikas Nair', startTime: '12:30', endTime: '01:15', room: 'Computer Lab' },
  { period: 9, subject: 'Physical Education', teacher: 'Mr. Amit Singh', startTime: '01:15', endTime: '02:00', room: 'Ground' },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Annual Sports Day Registration Open',
    body: 'Register for Annual Sports Day events by May 25. Multiple disciplines available.',
    isRead: false,
    createdAt: '2025-05-13T10:00:00Z',
  },
  {
    id: 'ann-002',
    title: 'Unit Test 2 Schedule Released',
    body: 'Unit Test 2 schedule has been published. First exam: Mathematics on May 20.',
    isRead: true,
    createdAt: '2025-05-08T09:00:00Z',
  },
  {
    id: 'ann-003',
    title: 'Library Hours Extended',
    body: 'School library will remain open until 5 PM from May 15 to June 15 for exam preparation.',
    isRead: true,
    createdAt: '2025-05-07T11:00:00Z',
  },
];

export const mockDashboardData: DashboardData = {
  greeting: 'Good morning',
  stats: {
    attendancePercent: 89,
    attendanceTrend: 2,
    nextExam: { subject: 'Mathematics', daysLeft: 5 },
    studyStreak: 12,
    classRank: 5,
    totalStudents: 42,
  },
  readinessScore: 72,
  upcomingExams: mockUpcomingExams.slice(0, 3),
  recentMarks: mockExamResults.slice(0, 5),
  todayTimetable: mockTodayTimetable,
  announcements: mockAnnouncements,
  recentAchievements: mockAchievements.filter(a => a.earned).slice(0, 3),
};
