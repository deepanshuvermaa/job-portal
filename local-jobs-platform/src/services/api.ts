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

let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    console.log(`🔄 Refreshing access token... (attempt ${refreshAttempts + 1}/${MAX_REFRESH_ATTEMPTS})`);

    const response = await axios.post(`${API_BASE_URL}/api/firebase-auth/refresh-token`, {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

    console.log('✅ Token refreshed successfully');

    // Update stored tokens
    updateStoredTokens(accessToken, newRefreshToken);

    // Reset attempt counter on success
    refreshAttempts = 0;

    return accessToken;
  } catch (error: any) {
    refreshAttempts++;

    console.error(`❌ Token refresh failed (attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS}):`, error.message);

    // Check if it's a network error (not authentication error)
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK';

    if (isNetworkError && refreshAttempts < MAX_REFRESH_ATTEMPTS) {
      console.log('🔄 Network error detected, will retry on next request');
      return null; // Don't logout, just return null to fail this request
    }

    // If it's an auth error (401, 403) or we've exceeded retries, force re-login
    if (error.response?.status === 401 || error.response?.status === 403 || refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      console.log('🚪 Refresh token invalid or expired, forcing re-login');
      refreshAttempts = 0; // Reset for next session
      localStorage.removeItem('auth-storage');

      // Only redirect if we're not already on an auth page
      const currentPath = window.location.pathname;
      const basePath = import.meta.env.BASE_URL || '/';
      if (!currentPath.includes('/auth') && currentPath !== basePath) {
        window.location.href = `${basePath}auth/phone`;
      }
    }

    return null;
  }
};

// Request interceptor - Add auth token + invalidate cache on mutations
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Invalidate cache on any mutation (POST/PUT/DELETE)
  if (config.method && ['post', 'put', 'delete', 'patch'].includes(config.method)) {
    apiCache.clear();
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

// Simple in-memory cache for GET requests to reduce redundant API calls
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 60 * 1000; // 2 hours default

export const cachedGet = async (url: string, ttl = CACHE_TTL) => {
  const cached = apiCache.get(url);
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }

  const response = await api.get(url);
  apiCache.set(url, { data: response, timestamp: Date.now() });
  return response;
};

export const invalidateCache = (urlPattern?: string) => {
  if (!urlPattern) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.includes(urlPattern)) {
      apiCache.delete(key);
    }
  }
};
