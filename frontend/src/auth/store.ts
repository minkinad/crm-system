import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthResponse, UserProfile } from '../shared/types/auth';

interface AuthState {
  accessToken: string | null;
  csrfToken: string | null;
  user: UserProfile | null;
  setSession: (payload: AuthResponse) => void;
  clearSession: () => void;
}

// Zustand store keeps minimal auth session state for SPA runtime.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      csrfToken: null,
      user: null,
      setSession: (payload) =>
        set({
          accessToken: payload.accessToken,
          csrfToken: payload.csrfToken,
          user: payload.user
        }),
      clearSession: () =>
        set({
          accessToken: null,
          csrfToken: null,
          user: null
        })
    }),
    {
      name: 'crm-auth-session'
    }
  )
);
