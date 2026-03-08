import { api } from './api';

export const editJob = async (jobId: string, payload: any) => {
  const { data } = await api.put(`/api/employers/jobs/${jobId}`, payload);
  return data.data;
};

export const closeJob = async (jobId: string) => {
  const { data } = await api.put(`/api/employers/jobs/${jobId}/close`);
  return data.data;
};

export const reopenJob = async (jobId: string) => {
  const { data } = await api.put(`/api/employers/jobs/${jobId}/reopen`);
  return data.data;
};

export const extendJob = async (jobId: string, days: number = 30) => {
  const { data } = await api.put(`/api/employers/jobs/${jobId}/extend`, { days });
  return data.data;
};

export const getJobAnalytics = async (jobId: string) => {
  const { data } = await api.get(`/api/employers/jobs/${jobId}/analytics`);
  return data.data;
};

export const withdrawApplication = async (applicationId: string) => {
  const { data } = await api.delete(`/api/workers/applications/${applicationId}`);
  return data.data;
};

export const bulkUpdateApplications = async (applicationIds: string[], status: string, employer_notes?: string) => {
  const { data } = await api.put('/api/employers/applications/bulk', {
    applicationIds,
    status,
    employer_notes
  });
  return data.data;
};

export const updateApplicationWithInterview = async (
  applicationId: string,
  status: string,
  interview_scheduled_at?: string,
  interview_location?: string,
  employer_notes?: string
) => {
  const { data } = await api.put(`/api/employers/applications/${applicationId}`, {
    status,
    interview_scheduled_at,
    interview_location,
    employer_notes
  });
  return data.data;
};
