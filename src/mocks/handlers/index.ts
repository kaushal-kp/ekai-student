import { authHandlers } from './auth';
import { studentHandlers } from './student';

export const handlers = [...authHandlers, ...studentHandlers];
