import { create } from 'zustand';
import { Subject, LeaveBalance, Achievement } from '../types/models';

interface StudentState {
  subjects: Subject[];
  leaveBalances: LeaveBalance[];
  achievements: Achievement[];
  notificationCount: number;
  inboxUnreadCount: number;

  setSubjects: (subjects: Subject[]) => void;
  setLeaveBalances: (balances: LeaveBalance[]) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setNotificationCount: (count: number) => void;
  setInboxUnreadCount: (count: number) => void;
  decrementNotificationCount: () => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  subjects: [],
  leaveBalances: [],
  achievements: [],
  notificationCount: 0,
  inboxUnreadCount: 0,

  setSubjects: (subjects) => set({ subjects }),
  setLeaveBalances: (leaveBalances) => set({ leaveBalances }),
  setAchievements: (achievements) => set({ achievements }),
  setNotificationCount: (count) => set({ notificationCount: count }),
  setInboxUnreadCount: (count) => set({ inboxUnreadCount: count }),
  decrementNotificationCount: () =>
    set((state) => ({ notificationCount: Math.max(0, state.notificationCount - 1) })),
}));
