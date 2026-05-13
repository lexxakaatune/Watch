import api from './index';

export const uploadAPI = {
  getUploadUrl: (data) => api.post('/upload/url', data),
  confirmUpload: (data) => api.post('/upload/confirm', data),
  getUploadStatus: (id) => api.get(`/upload/status/${id}`),
};
