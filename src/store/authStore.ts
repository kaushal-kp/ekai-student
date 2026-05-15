import { create } from 'zustand';
import { Student } from '../types/models';
import { setAccessToken } from '../lib/api';

interface AuthState {
  student: Student | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionId: string | null;

  setAuth: (student: Student, token: string, sessionId: string) => void;
  clearAuth: () => void;
  updateStudent: (updates: Partial<Student>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  student: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
  sessionId: null,

  setAuth: (student, token, sessionId) => {
    setAccessToken(token);
    localStorage.setItem('ekai_demo_auth', JSON.stringify({ student, token, sessionId }));
    set({ student, accessToken: token, isAuthenticated: true, sessionId, isLoading: false });
  },

  clearAuth: () => {
    setAccessToken(null);
    localStorage.removeItem('ekai_demo_auth');
    set({ student: null, accessToken: null, isAuthenticated: false, sessionId: null });
  },

  updateStudent: (updates) => {
    set((state) => ({
      student: state.student ? { ...state.student, ...updates } : null,
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
