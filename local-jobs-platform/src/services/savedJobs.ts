import { api } from './api';

export const saveJob = async (jobId: string) => {
  const { data } = await api.post(`/api/workers/jobs/${jobId}/save`);
  return data.data;
};

export const unsaveJob = async (jobId: string) => {
  const { data } = await api.delete(`/api/workers/jobs/${jobId}/save`);
  return data.data;
};

export const getSavedJobs = async () => {
  const { data } = await api.get('/api/workers/saved-jobs');
  return data.data;
};

export const checkIfJobSaved = async (jobId: string) => {
  const { data } = await api.get(`/api/workers/jobs/${jobId}/is-saved`);
  return data.data.isSaved;
};

export const checkIfJobApplied = async (jobId: string) => {
  const { data } = await api.get(`/api/workers/jobs/${jobId}/is-applied`);
  return data.data.isApplied;
};
