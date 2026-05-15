import api from './index';

const uploadAPI = {
  getUploadUrl: (data) => api.post('/upload/url', data),
  confirmUpload: (data) => api.post('/upload/confirm', data),
  getUploadStatus: (id) => api.get(`/upload/status/${id}`),
  uploadDirect: (formData) => api.post('/upload/direct', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export default uploadAPI;
