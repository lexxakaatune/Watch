import api from './index';

const uploadAPI = {
  getUploadUrl: (data) => api.post('/upload/url', data),
  confirmUpload: (data) => api.post('/upload/confirm', data),
  getUploadStatus: (id) => api.get(`/upload/status/${id}`),
};

export default uploadAPI;
