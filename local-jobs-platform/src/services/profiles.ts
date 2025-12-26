import { api, MOCK_MODE } from './api';
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
  const { data } = await api.get('/api/workers/profile');
  return data.data;
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
  const { data } = await api.get('/api/employers/profile');
  return data.data;
};

export const updateEmployerProfile = async (payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockUpdateEmployerProfile(payload);
  }
  const { data } = await api.put('/api/employers/profile', payload);
  return data.data;
};
