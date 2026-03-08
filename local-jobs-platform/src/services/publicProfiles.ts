import { api } from './api';

export const getPublicWorkerProfile = async (workerId: string) => {
  const { data } = await api.get(`/api/public/workers/${workerId}`);
  return data.data;
};

export const getPublicEmployerProfile = async (employerId: string) => {
  const { data } = await api.get(`/api/public/employers/${employerId}`);
  return data.data;
};
