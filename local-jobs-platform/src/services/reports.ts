import { api } from './api';

export interface CreateReportData {
  reported_user_id?: string;
  reported_job_id?: string;
  reason: 'fake_profile' | 'spam' | 'harassment' | 'fraud' | 'inappropriate_content' | 'other';
  description: string;
}

export const createReport = async (payload: CreateReportData) => {
  const { data } = await api.post('/api/reports', payload);
  return data.data;
};

export const getMyReports = async () => {
  const { data } = await api.get('/api/reports/my');
  return data.data;
};

export const getAllReports = async (status?: string) => {
  const { data } = await api.get('/api/admin/reports', { params: { status } });
  return data.data;
};

export const updateReportStatus = async (reportId: string, status: string, admin_notes?: string) => {
  const { data } = await api.put(`/api/admin/reports/${reportId}`, { status, admin_notes });
  return data.data;
};
