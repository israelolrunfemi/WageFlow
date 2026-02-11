import type { SessionData } from '../types/session.js';

export const defaultSession: SessionData = {
  state: 'idle',
  pinVerified: false,
  pinAttempts: 0,
};
