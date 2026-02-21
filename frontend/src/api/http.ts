import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../auth/store';
import { AuthResponse } from '../shared/types/auth';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Shared Axios client with JWT, tenant and CSRF headers + token refresh flow.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  withCredentials: true
});

apiClient.interceptors.request.use((config) => {
  const { accessToken, csrfToken, user } = useAuthStore.getState();
  const headers = (config.headers ?? {}) as Record<string, string>;
  config.headers = headers;

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  if (user?.tenantId) {
    headers['x-tenant-id'] = user.tenantId;
  }

  const method = (config.method ?? 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
    headers['x-csrf-token'] = csrfToken;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const tenantId = useAuthStore.getState().user?.tenantId;
      const refreshResponse = await axios.post<AuthResponse>(
        `${apiClient.defaults.baseURL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: tenantId ? { 'x-tenant-id': tenantId } : undefined
        }
      );

      useAuthStore.getState().setSession(refreshResponse.data);
      const headers = (originalRequest.headers ?? {}) as Record<string, string>;
      originalRequest.headers = headers;
      headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
      headers['x-csrf-token'] = refreshResponse.data.csrfToken;
      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    }
  }
);
