import { api, MOCK_MODE } from './api';
import {
  mockGetAdminDashboard,
  mockGetPendingVerifications,
  mockVerifyWorker,
  mockVerifyEmployer,
  mockGetPendingJobs,
  mockApproveJob,
  mockRejectJob,
} from './mockStore';

export const getAdminDashboard = async () => {
  if (MOCK_MODE) {
    return mockGetAdminDashboard();
  }
  const { data } = await api.get('/api/admin/dashboard');
  return data.data;
};

export const getPendingVerifications = async () => {
  if (MOCK_MODE) {
    return mockGetPendingVerifications();
  }
  const { data } = await api.get('/api/admin/pending-verifications');
  return data.data;
};

export const verifyWorker = async (userId: string, payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockVerifyWorker(userId, payload);
  }
  const { data } = await api.put(`/api/admin/workers/${userId}/verify`, payload);
  return data.data;
};

export const verifyEmployer = async (userId: string, payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockVerifyEmployer(userId, payload);
  }
  const { data } = await api.put(`/api/admin/employers/${userId}/verify`, payload);
  return data.data;
};

export const getPendingJobs = async () => {
  if (MOCK_MODE) {
    return mockGetPendingJobs();
  }
  const { data } = await api.get('/api/admin/jobs/pending');
  return data.data;
};

export const approveJob = async (jobId: string) => {
  if (MOCK_MODE) {
    return mockApproveJob(jobId);
  }
  const { data } = await api.put(`/api/admin/jobs/${jobId}/approve`);
  return data.data;
};

export const rejectJob = async (jobId: string) => {
  if (MOCK_MODE) {
    return mockRejectJob(jobId);
  }
  const { data } = await api.put(`/api/admin/jobs/${jobId}/reject`);
  return data.data;
};
