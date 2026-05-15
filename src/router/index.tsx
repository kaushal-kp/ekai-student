import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/shared/AppShell';
import { AuthGuard, GuestGuard } from './guards';
import { ROUTES } from '@/lib/constants';
import { PageLoader } from '@/components/shared/LoadingSpinner';

const lazyLoad = (factory: () => Promise<{ default: React.ComponentType<any> }>) => {
  const Component = lazy(factory);
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to={ROUTES.DASHBOARD} replace />,
  },
  {
    path: ROUTES.LOGIN,
    element: <GuestGuard>{lazyLoad(() => import('@/features/auth/LoginPage'))}</GuestGuard>,
  },
  {
    path: ROUTES.ONBOARDING,
    element: <AuthGuard>{lazyLoad(() => import('@/features/onboarding/OnboardingPage'))}</AuthGuard>,
  },
  {
    path: '/',
    element: <AuthGuard><AppShell /></AuthGuard>,
    children: [
      { path: ROUTES.DASHBOARD, element: lazyLoad(() => import('@/features/dashboard/DashboardPage')) },
      { path: ROUTES.ACADEMICS, element: lazyLoad(() => import('@/features/academics/AcademicsPage')) },
      { path: ROUTES.ACADEMICS_SUBJECT, element: lazyLoad(() => import('@/features/academics/SubjectDetailPage')) },
      { path: ROUTES.PERFORMANCE, element: lazyLoad(() => import('@/features/performance/PerformancePage')) },
      { path: ROUTES.EXAMS, element: lazyLoad(() => import('@/features/exams/ExamsPage')) },
      { path: ROUTES.REPORT_CARD, element: lazyLoad(() => import('@/features/report-card/ReportCardPage')) },
      { path: ROUTES.READINESS_SCORE, element: lazyLoad(() => import('@/features/readiness-score/ReadinessScorePage')) },
      { path: ROUTES.ATTENDANCE, element: lazyLoad(() => import('@/features/attendance/AttendancePage')) },
      { path: ROUTES.LEAVE_REQUEST, element: lazyLoad(() => import('@/features/leave/LeaveRequestPage')) },
      { path: ROUTES.LEAVE_STATUS, element: lazyLoad(() => import('@/features/leave/LeaveStatusPage')) },
      { path: ROUTES.PROFILE, element: lazyLoad(() => import('@/features/profile/ProfilePage')) },
      { path: ROUTES.APAAR, element: lazyLoad(() => import('@/features/apaar/APAARPage')) },
      { path: ROUTES.SHARING, element: lazyLoad(() => import('@/features/sharing/SharingPage')) },
      { path: ROUTES.ACHIEVEMENTS, element: lazyLoad(() => import('@/features/achievements/AchievementsPage')) },
      { path: ROUTES.CO_CURRICULAR, element: lazyLoad(() => import('@/features/co-curricular/CoCurricularPage')) },
      { path: ROUTES.CAREER, element: lazyLoad(() => import('@/features/career/CareerPage')) },
      { path: ROUTES.OPPORTUNITIES, element: lazyLoad(() => import('@/features/opportunities/OpportunitiesPage')) },
      { path: ROUTES.INBOX, element: lazyLoad(() => import('@/features/inbox/InboxPage')) },
      { path: ROUTES.NOTIFICATIONS, element: lazyLoad(() => import('@/features/notifications/NotificationsPage')) },
      { path: ROUTES.SETTINGS, element: lazyLoad(() => import('@/features/settings/SettingsPage')) },
      { path: ROUTES.SETTINGS_SECURITY, element: lazyLoad(() => import('@/features/security/SecurityPage')) },
      { path: ROUTES.SETTINGS_PRIVACY, element: lazyLoad(() => import('@/features/privacy/PrivacyPage')) },
      { path: ROUTES.CONSENT, element: lazyLoad(() => import('@/features/consent/ConsentPage')) },
    ],
  },
  {
    path: '*',
    element: <div className="flex items-center justify-center h-screen flex-col gap-4">
      <p className="text-6xl">404</p>
      <p className="text-[var(--color-text-secondary)]">Page not found</p>
      <a href={ROUTES.DASHBOARD} className="text-[var(--color-primary)] underline">Go to Dashboard</a>
    </div>,
  },
]);
