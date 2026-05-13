import api from './index';

export const creatorAPI = {
  getDashboard: () => api.get('/creator/dashboard'),
  getAnalytics: () => api.get('/creator/analytics'),
  getEarnings: () => api.get('/creator/earnings'),
  updateVideo: (id, data) => api.put(`/creator/videos/${id}`, data),
  deleteVideo: (id) => api.delete(`/creator/videos/${id}`),
};
