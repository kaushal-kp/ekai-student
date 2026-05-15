import { http, HttpResponse } from 'msw';
import { mockStudent } from '../data/student';

export const authHandlers = [
  http.post('/api/v1/auth/login', async ({ request }) => {
    await new Promise(r => setTimeout(r, 500));
    return HttpResponse.json({
      status: 'success',
      data: { sessionId: 'session-mock-001', message: 'OTP sent successfully' },
    });
  }),

  http.post('/api/v1/auth/verify-otp', async ({ request }) => {
    await new Promise(r => setTimeout(r, 600));
    return HttpResponse.json({
      status: 'success',
      data: {
        accessToken: 'mock-access-token-xyz',
        student: mockStudent,
        sessionId: 'session-mock-001',
        isNewUser: false,
      },
    });
  }),

  http.post('/api/v1/auth/refresh', async () => {
    return HttpResponse.json({
      status: 'success',
      data: { accessToken: 'mock-access-token-refreshed' },
    });
  }),

  http.post('/api/v1/auth/logout', async () => {
    return HttpResponse.json({ status: 'success', data: null });
  }),
];
