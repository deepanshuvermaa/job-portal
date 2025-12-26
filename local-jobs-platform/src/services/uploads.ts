import { api, MOCK_MODE } from './api';
import { mockUploadWorkerDocument, mockUploadEmployerDocument } from './mockStore';

export const uploadWorkerDocument = async (documentType: string, file: File) => {
  if (MOCK_MODE) {
    return mockUploadWorkerDocument(documentType, file);
  }
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  const { data } = await api.post('/api/workers/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
};

export const uploadEmployerDocument = async (documentType: string, file: File) => {
  if (MOCK_MODE) {
    return mockUploadEmployerDocument(documentType, file);
  }
  const formData = new FormData();
  formData.append('document', file);
  formData.append('documentType', documentType);

  const { data } = await api.post('/api/employers/upload-document', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return data.data;
};
