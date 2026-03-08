import { api } from './api';

export interface CreateReviewData {
  reviewee_id: string;
  job_id: string;
  application_id?: string;
  rating: number;
  comment: string;
  review_type: 'worker_to_employer' | 'employer_to_worker';
}

export const createReview = async (payload: CreateReviewData) => {
  const { data } = await api.post('/api/reviews', payload);
  return data.data;
};

export const getWorkerReviews = async (workerId: string) => {
  const { data } = await api.get(`/api/workers/${workerId}/reviews`);
  return data.data;
};

export const getEmployerReviews = async (employerId: string) => {
  const { data } = await api.get(`/api/employers/${employerId}/reviews`);
  return data.data;
};
