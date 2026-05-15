import { AttendanceDay, MonthlyAttendance, LeaveBalance } from '../../types/models';
import { AttendanceStatus, LeaveType } from '../../types/enums';

export const mockMonthlyAttendance: MonthlyAttendance[] = [
  {
    month: '2025-05',
    workingDays: 20,
    present: 16,
    absent: 2,
    late: 1,
    leave: 1,
    percentage: 85,
  },
  {
    month: '2025-04',
    workingDays: 25,
    present: 22,
    absent: 1,
    late: 2,
    leave: 0,
    percentage: 92,
  },
  {
    month: '2025-03',
    workingDays: 22,
    present: 20,
    absent: 0,
    late: 1,
    leave: 1,
    percentage: 95,
  },
  {
    month: '2025-02',
    workingDays: 20,
    present: 18,
    absent: 2,
    late: 0,
    leave: 0,
    percentage: 90,
  },
  {
    month: '2025-01',
    workingDays: 22,
    present: 19,
    absent: 1,
    late: 2,
    leave: 0,
    percentage: 95,
  },
  {
    month: '2024-12',
    workingDays: 18,
    present: 16,
    absent: 1,
    late: 1,
    leave: 0,
    percentage: 94,
  },
];

export const mockAttendanceDays: AttendanceDay[] = [
  // May 2025 attendance
  { date: '2025-05-01', status: AttendanceStatus.PRESENT },
  { date: '2025-05-02', status: AttendanceStatus.PRESENT },
  { date: '2025-05-03', status: AttendanceStatus.HOLIDAY },
  { date: '2025-05-04', status: AttendanceStatus.HOLIDAY },
  { date: '2025-05-05', status: AttendanceStatus.PRESENT },
  { date: '2025-05-06', status: AttendanceStatus.ABSENT },
  { date: '2025-05-07', status: AttendanceStatus.PRESENT },
  { date: '2025-05-08', status: AttendanceStatus.PRESENT },
  { date: '2025-05-09', status: AttendanceStatus.PRESENT },
  { date: '2025-05-10', status: AttendanceStatus.HOLIDAY },
  { date: '2025-05-11', status: AttendanceStatus.HOLIDAY },
  { date: '2025-05-12', status: AttendanceStatus.LATE },
  { date: '2025-05-13', status: AttendanceStatus.PRESENT },
  { date: '2025-05-14', status: AttendanceStatus.LEAVE },
  { date: '2025-05-15', status: AttendanceStatus.PRESENT },
];

export const mockLeaveBalances: LeaveBalance[] = [
  {
    type: LeaveType.MEDICAL,
    label: 'Medical Leave',
    allocated: 10,
    used: 2,
    remaining: 8,
  },
  {
    type: LeaveType.PERSONAL,
    label: 'Personal Leave',
    allocated: 5,
    used: 1,
    remaining: 4,
  },
  {
    type: LeaveType.FAMILY_EMERGENCY,
    label: 'Family Emergency',
    allocated: 3,
    used: 0,
    remaining: 3,
  },
  {
    type: LeaveType.EVENT_PARTICIPATION,
    label: 'Event Participation',
    allocated: 5,
    used: 1,
    remaining: 4,
  },
];
