import { api, MOCK_MODE } from './api';
import {
  mockSendOtp,
  mockVerifyOtp,
  mockRegisterWorker,
  mockRegisterEmployer,
  mockLogin,
  mockAdminLogin,
  mockLoadCurrentUser,
} from './mockStore';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthVerifyResponse {
  verified: boolean;
  signupRequired: boolean;
  user?: any;
  tokens?: AuthTokens;
}

export const sendOtp = async (phone: string, purpose: string = 'registration') => {
  if (MOCK_MODE) {
    return mockSendOtp(phone);
  }
  const { data } = await api.post('/api/auth/send-otp', { phone, purpose });
  return data;
};

export const verifyOtp = async (phone: string, otp: string, purpose: string = 'registration') => {
  if (MOCK_MODE) {
    return mockVerifyOtp(phone, otp);
  }
  const { data } = await api.post('/api/auth/verify-otp', { phone, otp, purpose });
  return data.data as AuthVerifyResponse;
};

export const registerWorker = async (payload: any) => {
  if (MOCK_MODE) {
    return mockRegisterWorker(payload);
  }
  const { data } = await api.post('/api/auth/register/worker', payload);
  return data.data;
};

export const registerEmployer = async (payload: any) => {
  if (MOCK_MODE) {
    return mockRegisterEmployer(payload);
  }
  const { data } = await api.post('/api/auth/register/employer', payload);
  return data.data;
};

export const login = async (phone: string, password: string) => {
  if (MOCK_MODE) {
    return mockLogin(phone, password);
  }
  const { data } = await api.post('/api/auth/login', { phone, password });
  return data.data;
};

export const adminLogin = async (password: string) => {
  if (MOCK_MODE) {
    return mockAdminLogin(password);
  }
  const { data } = await api.post('/api/auth/admin/login', { password });
  return data.data;
};

export const loadCurrentUser = async () => {
  if (MOCK_MODE) {
    return mockLoadCurrentUser();
  }
  const { data } = await api.get('/api/auth/me');
  return data.data;
};
