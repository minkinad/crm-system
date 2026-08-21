import axios, { AxiosError, AxiosHeaders, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../auth/store';
import { AuthResponse } from '../shared/types/auth';

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Shared Axios client with JWT and CSRF headers + token refresh flow.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1',
  withCredentials: true
});

let refreshPromise: Promise<AuthResponse> | null = null;

function readCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`;
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
}

export function refreshSession(): Promise<AuthResponse> {
  if (refreshPromise) {
    return refreshPromise;
  }

  const store = useAuthStore.getState();
  store.setLoading();
  const csrfCookieName = import.meta.env.VITE_CSRF_COOKIE_NAME ?? 'crm_csrf_token';
  const csrfToken = store.csrfToken ?? readCookie(csrfCookieName);

  refreshPromise = axios
    .post<AuthResponse>(
      `${apiClient.defaults.baseURL}/auth/refresh`,
      {},
      {
        withCredentials: true,
        headers: csrfToken ? { 'x-csrf-token': csrfToken } : undefined
      }
    )
    .then((response) => {
      useAuthStore.getState().setSession(response.data);
      return response.data;
    })
    .catch((error: unknown) => {
      useAuthStore.getState().clearSession();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

function getLoginLocation(): string {
  const basePath = import.meta.env.BASE_URL ?? '/';
  return import.meta.env.VITE_ROUTER_MODE === 'hash' ? `${basePath}#/login` : `${basePath}login`;
}

apiClient.interceptors.request.use((config) => {
  const { accessToken, csrfToken } = useAuthStore.getState();
  const headers = AxiosHeaders.from(config.headers);
  config.headers = headers;

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  const method = (config.method ?? 'get').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrfToken) {
    headers.set('x-csrf-token', csrfToken);
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;
    const isCredentialRequest = ['/auth/login', '/auth/register'].some((path) =>
      originalRequest?.url?.endsWith(path)
    );

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      isCredentialRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const refreshedSession = await refreshSession();
      const headers = AxiosHeaders.from(originalRequest.headers);
      originalRequest.headers = headers;
      headers.set('Authorization', `Bearer ${refreshedSession.accessToken}`);
      headers.set('x-csrf-token', refreshedSession.csrfToken);
      return apiClient(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearSession();
      window.location.replace(getLoginLocation());
      return Promise.reject(refreshError);
    }
  }
);
