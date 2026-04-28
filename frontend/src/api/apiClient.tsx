import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Module-level access token (accessible by interceptors outside React)
let accessToken = "";

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function getAccessToken(): string {
  return accessToken;
}

function getCsrfToken(): string {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]*)/);
  return match ? match[1] : "";
}

// Singleton Axios instance
const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  timeout: 10000,
});

// 401 retry queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (config: InternalAxiosRequestConfig) => void;
  reject: (error: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

// Callback to notify AuthContext of logout (set by AuthContext on mount)
let onLogout: (() => void) | null = null;

export function setOnLogout(callback: () => void): void {
  onLogout = callback;
}

function processQueue(error: unknown, newToken: string | null): void {
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (newToken) {
      config.headers["Authorization"] = `Bearer ${newToken}`;
      resolve(config);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
}

// Request interceptor: attach CSRF token and access token
apiClient.interceptors.request.use(
  (config) => {
    const csrf = getCsrfToken();
    if (csrf) {
      config.headers["X-XSRF-TOKEN"] = csrf;
    }
    if (accessToken && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor: handle 401 with automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Only intercept 401s, and not for auth endpoints themselves
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest.url === "/refresh-token" ||
      originalRequest.url === "/login" ||
      originalRequest.url === "/register"
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (config) => resolve(apiClient(config)),
          reject,
          config: originalRequest,
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await apiClient.post("/refresh-token", {});
      const newToken = response.data.accessToken;
      accessToken = newToken;

      // Retry all queued requests
      processQueue(null, newToken);

      // Retry the original request
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      accessToken = "";
      if (onLogout) {
        onLogout();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
