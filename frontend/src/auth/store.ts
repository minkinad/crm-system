import { create } from 'zustand';
import { AuthResponse, UserProfile } from '../shared/types/auth';

const CSRF_STORAGE_KEY = 'crm-csrf-token';

interface AuthState {
  accessToken: string | null;
  csrfToken: string | null;
  user: UserProfile | null;
  status: 'idle' | 'loading' | 'authenticated' | 'anonymous';
  setLoading: () => void;
  setSession: (payload: AuthResponse) => void;
  clearSession: () => void;
}

// Credentials stay in memory; the HttpOnly refresh cookie restores the session after reload.
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  csrfToken: window.localStorage.getItem(CSRF_STORAGE_KEY),
  user: null,
  status: 'idle',
  setLoading: () => set({ status: 'loading' }),
  setSession: (payload) => {
    window.localStorage.setItem(CSRF_STORAGE_KEY, payload.csrfToken);
    set({
      accessToken: payload.accessToken,
      csrfToken: payload.csrfToken,
      user: payload.user,
      status: 'authenticated'
    });
  },
  clearSession: () => {
    window.localStorage.removeItem(CSRF_STORAGE_KEY);
    set({
      accessToken: null,
      csrfToken: null,
      user: null,
      status: 'anonymous'
    });
  }
}));
