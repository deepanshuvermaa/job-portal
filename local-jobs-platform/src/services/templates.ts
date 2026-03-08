import { api } from './api';

export interface JobTemplateData {
  template_name: string;
  title: string;
  description: string;
  job_type: string;
  employment_type: string;
  location: string;
  city: string;
  state?: string;
  pincode?: string;
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  required_skills?: string[];
  experience_required?: number;
  education_required?: string;
  vacancies?: number;
  benefits?: string[];
  working_hours?: string;
  contact_phone?: string;
  contact_email?: string;
}

export const createJobTemplate = async (payload: JobTemplateData) => {
  const { data } = await api.post('/api/employers/templates', payload);
  return data.data;
};

export const getJobTemplates = async () => {
  const { data } = await api.get('/api/employers/templates');
  return data.data;
};

export const deleteJobTemplate = async (templateId: string) => {
  const { data } = await api.delete(`/api/employers/templates/${templateId}`);
  return data.data;
};

export const createJobFromTemplate = async (templateId: string) => {
  const { data } = await api.post(`/api/employers/templates/${templateId}/create-job`);
  return data.data;
};
