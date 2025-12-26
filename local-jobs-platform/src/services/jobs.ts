import { api, MOCK_MODE } from './api';
import {
  mockSearchJobs,
  mockGetJob,
  mockApplyToJob,
  mockGetWorkerApplications,
  mockCreateJob,
  mockGetEmployerJobs,
  mockGetEmployerJobApplications,
  mockUpdateApplicationStatus,
} from './mockStore';

export const searchJobs = async (params: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockSearchJobs(params);
  }
  const { data } = await api.get('/api/workers/jobs/search', { params });
  return data.data;
};

export const getJob = async (jobId: string) => {
  if (MOCK_MODE) {
    return mockGetJob(jobId);
  }
  const { data } = await api.get(`/api/jobs/${jobId}`);
  return data.data;
};

export const applyToJob = async (jobId: string, payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockApplyToJob(jobId, payload);
  }
  const { data } = await api.post(`/api/workers/jobs/${jobId}/apply`, payload);
  return data.data;
};

export const getWorkerApplications = async () => {
  if (MOCK_MODE) {
    return mockGetWorkerApplications();
  }
  const { data } = await api.get('/api/workers/applications');
  return data.data;
};

export const createJob = async (payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockCreateJob(payload);
  }
  const { data } = await api.post('/api/employers/jobs', payload);
  return data.data;
};

export const getEmployerJobs = async () => {
  if (MOCK_MODE) {
    return mockGetEmployerJobs();
  }
  const { data } = await api.get('/api/employers/jobs');
  return data.data;
};

export const getEmployerJobApplications = async (jobId: string) => {
  if (MOCK_MODE) {
    return mockGetEmployerJobApplications(jobId);
  }
  const { data } = await api.get(`/api/employers/jobs/${jobId}/applications`);
  return data.data;
};

export const updateApplicationStatus = async (applicationId: string, payload: Record<string, any>) => {
  if (MOCK_MODE) {
    return mockUpdateApplicationStatus(applicationId, payload);
  }
  const { data } = await api.put(`/api/employers/applications/${applicationId}`, payload);
  return data.data;
};
