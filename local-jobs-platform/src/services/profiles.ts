import { api, MOCK_MODE, cachedGet } from './api';
import {
  mockGetWorkerProfile,
  mockUpdateWorkerProfile,
  mockGetEmployerProfile,
  mockUpdateEmployerProfile,
} from './mockStore';

export const getWorkerProfile = async () => {
  if (MOCK_MODE) {
    return mockGetWorkerProfile();
  }
  const response = await cachedGet('/api/workers/profile');
  return response.data.data;
};

export const updateWorkerProfile = async (payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockUpdateWorkerProfile(payload);
  }
  const { data } = await api.put('/api/workers/profile', payload);
  return data.data;
};

export const getEmployerProfile = async () => {
  if (MOCK_MODE) {
    return mockGetEmployerProfile();
  }
  const response = await cachedGet('/api/employers/profile');
  return response.data.data;
};

export const updateEmployerProfile = async (payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockUpdateEmployerProfile(payload);
  }
  const { data } = await api.put('/api/employers/profile', payload);
  return data.data;
};
