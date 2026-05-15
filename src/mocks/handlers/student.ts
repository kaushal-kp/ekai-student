import { http, HttpResponse } from 'msw';
import { mockStudent } from '../data/student';
import { mockDashboardData } from '../data/dashboard';
import { mockSubjects } from '../data/subjects';
import { mockExamResults, mockUpcomingExams } from '../data/exams';
import { mockMonthlyAttendance, mockAttendanceDays, mockLeaveBalances } from '../data/attendance';
import { mockLeaveRequests } from '../data/leaves';
import { mockAchievements } from '../data/achievements';
import { mockNotifications, mockInboxThreads } from '../data/notifications';
import { mockShareLinks, mockConsentLogs } from '../data/sharing';
import { mockCareerRecommendations, mockScholarships, mockInternships, mockCoCurricularActivities, mockReadinessScore } from '../data/career';

export const studentHandlers = [
  // Profile
  http.get('/api/v1/student/profile', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockStudent });
  }),

  http.patch('/api/v1/student/profile', async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    await new Promise(r => setTimeout(r, 400));
    return HttpResponse.json({ status: 'success', data: { ...mockStudent, ...body } });
  }),

  // Dashboard
  http.get('/api/v1/student/dashboard', async () => {
    await new Promise(r => setTimeout(r, 400));
    return HttpResponse.json({ status: 'success', data: mockDashboardData });
  }),

  // Subjects
  http.get('/api/v1/student/subjects', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockSubjects });
  }),

  http.get('/api/v1/student/subjects/:subjectId', async ({ params }) => {
    const subject = mockSubjects.find(s => s.id === params.subjectId);
    if (!subject) return HttpResponse.json({ status: 'error', message: 'Not found' }, { status: 404 });
    return HttpResponse.json({ status: 'success', data: subject });
  }),

  // Exams
  http.get('/api/v1/student/exams/results', async () => {
    await new Promise(r => setTimeout(r, 400));
    return HttpResponse.json({ status: 'success', data: mockExamResults });
  }),

  http.get('/api/v1/student/exams/upcoming', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockUpcomingExams });
  }),

  // Attendance
  http.get('/api/v1/student/attendance/monthly', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockMonthlyAttendance });
  }),

  http.get('/api/v1/student/attendance/days', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockAttendanceDays });
  }),

  // Leave
  http.get('/api/v1/student/leave/balances', async () => {
    return HttpResponse.json({ status: 'success', data: mockLeaveBalances });
  }),

  http.get('/api/v1/student/leave/requests', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockLeaveRequests });
  }),

  http.post('/api/v1/student/leave/requests', async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    await new Promise(r => setTimeout(r, 600));
    const newRequest = {
      id: `leave-${Date.now()}`,
      ...body,
      duration: 1,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ status: 'success', data: newRequest }, { status: 201 });
  }),

  http.delete('/api/v1/student/leave/requests/:id', async () => {
    return HttpResponse.json({ status: 'success', data: null });
  }),

  // Achievements
  http.get('/api/v1/student/achievements', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockAchievements });
  }),

  // Notifications
  http.get('/api/v1/student/notifications', async () => {
    await new Promise(r => setTimeout(r, 200));
    return HttpResponse.json({ status: 'success', data: mockNotifications });
  }),

  http.patch('/api/v1/student/notifications/:id/read', async () => {
    return HttpResponse.json({ status: 'success', data: null });
  }),

  http.patch('/api/v1/student/notifications/read-all', async () => {
    return HttpResponse.json({ status: 'success', data: null });
  }),

  // Inbox
  http.get('/api/v1/student/inbox', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockInboxThreads });
  }),

  // Sharing
  http.get('/api/v1/student/sharing/links', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockShareLinks });
  }),

  http.post('/api/v1/student/sharing/links', async ({ request }) => {
    const body = await request.json() as Record<string, any>;
    await new Promise(r => setTimeout(r, 500));
    return HttpResponse.json({
      status: 'success',
      data: {
        id: `share-${Date.now()}`,
        ...body,
        url: `https://hub.ekai.in/s/arjun-${Date.now()}`,
        createdAt: new Date().toISOString(),
        views: 0,
        isActive: true,
      },
    }, { status: 201 });
  }),

  http.delete('/api/v1/student/sharing/links/:id', async () => {
    return HttpResponse.json({ status: 'success', data: null });
  }),

  // Consent
  http.get('/api/v1/student/consent', async () => {
    return HttpResponse.json({ status: 'success', data: mockConsentLogs });
  }),

  http.delete('/api/v1/student/consent/:id', async () => {
    await new Promise(r => setTimeout(r, 500));
    return HttpResponse.json({ status: 'success', data: null });
  }),

  // Career
  http.get('/api/v1/student/career/recommendations', async () => {
    await new Promise(r => setTimeout(r, 500));
    return HttpResponse.json({ status: 'success', data: mockCareerRecommendations });
  }),

  // Opportunities
  http.get('/api/v1/student/opportunities', async () => {
    await new Promise(r => setTimeout(r, 400));
    return HttpResponse.json({
      status: 'success',
      data: { scholarships: mockScholarships, internships: mockInternships, events: [] },
    });
  }),

  // Co-curricular
  http.get('/api/v1/student/co-curricular', async () => {
    await new Promise(r => setTimeout(r, 300));
    return HttpResponse.json({ status: 'success', data: mockCoCurricularActivities });
  }),

  // Readiness Score
  http.get('/api/v1/student/readiness-score', async () => {
    await new Promise(r => setTimeout(r, 500));
    return HttpResponse.json({ status: 'success', data: mockReadinessScore });
  }),

  // Security - Sessions
  http.get('/api/v1/student/security/sessions', async () => {
    return HttpResponse.json({
      status: 'success',
      data: [
        {
          id: 'sess-001',
          device: 'Chrome on Windows',
          browser: 'Chrome 120',
          location: 'New Delhi, India',
          lastActive: new Date().toISOString(),
          isCurrent: true,
        },
        {
          id: 'sess-002',
          device: 'Safari on iPhone',
          browser: 'Safari 17',
          location: 'New Delhi, India',
          lastActive: '2025-05-14T10:00:00Z',
          isCurrent: false,
        },
      ],
    });
  }),

  http.delete('/api/v1/student/security/sessions/:id', async () => {
    return HttpResponse.json({ status: 'success', data: null });
  }),

  // Data rights
  http.post('/api/v1/student/data/download', async () => {
    await new Promise(r => setTimeout(r, 1000));
    return HttpResponse.json({ status: 'success', data: { downloadUrl: '/mock-data-export.json' } });
  }),

  http.post('/api/v1/student/data/correction-request', async () => {
    await new Promise(r => setTimeout(r, 500));
    return HttpResponse.json({ status: 'success', data: { requestId: `corr-${Date.now()}` } });
  }),

  // APAAR
  http.get('/api/v1/student/apaar', async () => {
    await new Promise(r => setTimeout(r, 400));
    return HttpResponse.json({
      status: 'success',
      data: {
        apaarId: mockStudent.apaarId,
        apaarStatus: mockStudent.apaarStatus,
        linkedAt: '2024-09-01T00:00:00Z',
        records: [
          { year: '2024-25', class: '10', school: 'DPS Vasant Kunj', verified: true },
          { year: '2023-24', class: '9', school: 'DPS Vasant Kunj', verified: true },
          { year: '2022-23', class: '8', school: 'DPS Vasant Kunj', verified: true },
        ],
      },
    });
  }),

  // Avatar upload
  http.post('/api/v1/student/profile/avatar', async () => {
    await new Promise(r => setTimeout(r, 1000));
    return HttpResponse.json({
      status: 'success',
      data: { avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun${Date.now()}` },
    });
  }),
];
