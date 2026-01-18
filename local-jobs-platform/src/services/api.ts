import axios from 'axios';

// PRODUCTION MODE - Connected to Railway backend
export const MOCK_MODE = false;

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_FALLBACK = 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL || API_FALLBACK,
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

api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('auth-storage');
    }
    return Promise.reject(error);
  }
);

export const API_BASE = API_BASE_URL || API_FALLBACK;
