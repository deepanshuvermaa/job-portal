import axios from 'axios';

// PRODUCTION MODE - Connected to Railway backend
export const MOCK_MODE = false;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://job-portal-production-7fb3.up.railway.app';

console.log('=== API Configuration ===');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('MOCK_MODE:', MOCK_MODE);
console.log('========================');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getStoredToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch (error) {
    return null;
  }
};

const getStoredRefreshToken = (): string | null => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.refreshToken || null;
  } catch (error) {
    return null;
  }
};

const updateStoredTokens = (token: string, refreshToken?: string) => {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.state.token = token;
    if (refreshToken) {
      parsed.state.refreshToken = refreshToken;
    }
    localStorage.setItem('auth-storage', JSON.stringify(parsed));
  } catch (error) {
    console.error('Failed to update tokens:', error);
  }
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log('🔄 Refreshing access token...');

    const response = await axios.post(`${API_BASE_URL}/api/firebase-auth/refresh-token`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    console.log('✅ Token refreshed successfully');

    // Update stored tokens
    updateStoredTokens(accessToken, newRefreshToken);

    return accessToken;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    // Clear auth and force re-login
    localStorage.removeItem('auth-storage');
    window.location.href = '/auth/phone';
    return null;
  }
};

// Request interceptor - Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Handle token expiration and auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 error and we haven't tried refreshing yet
    if (error?.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, wait for the new token
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newToken = await refreshAccessToken();

      isRefreshing = false;

      if (newToken) {
        onTokenRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export const API_BASE = API_BASE_URL;
