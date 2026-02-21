import { apiClient } from './http';
import { AuthResponse } from '../shared/types/auth';

// API client for authentication and session lifecycle.
export const authApi = {
  register(payload: {
    tenantName: string;
    tenantSlug: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return apiClient.post<AuthResponse>('/auth/register', payload);
  },

  login(payload: { tenantSlug: string; email: string; password: string }) {
    return apiClient.post<AuthResponse>('/auth/login', payload);
  },

  logout() {
    return apiClient.post<{ success: boolean }>('/auth/logout');
  }
};
