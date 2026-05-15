import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './constants';
import { generateCorrelationId } from './utils';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshQueue: ((token: string) => void)[] = [];

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  config.headers['X-Correlation-ID'] = generateCorrelationId();
  config.headers['X-CSRF-Token'] = getCsrfToken();
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = response.data.data.accessToken;
        setAccessToken(newToken);
        refreshQueue.forEach((cb) => cb(newToken));
        refreshQueue = [];
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        setAccessToken(null);
        refreshQueue = [];
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      return Promise.reject({
        ...error,
        isRateLimited: true,
        retryAfter: retryAfter ? parseInt(retryAfter) : 60,
      });
    }

    return Promise.reject(mapApiError(error));
  }
);

function getCsrfToken(): string {
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : '';
}

function mapApiError(error: AxiosError): Error {
  const status = error.response?.status;
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested information could not be found.',
    409: 'A conflict occurred. Please try again.',
    422: 'Validation failed. Please check your input.',
    500: 'Something went wrong on our end. Please try again.',
    503: 'Service temporarily unavailable. Please try again later.',
  };

  const message = messages[status as number] || 'An unexpected error occurred. Please try again.';
  const mappedError = new Error(message);
  (mappedError as any).status = status;
  (mappedError as any).original = error;
  return mappedError;
}

export default api;
