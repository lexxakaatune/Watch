import api from './index';

export const moderatorAPI = {
  getDashboard: () => api.get('/moderator/dashboard'),
  getPendingUploads: () => api.get('/moderator/uploads'),
  moderateVideo: (id, action, reason) => api.post(`/moderator/videos/${id}`, { action, reason }),
  moderateComment: (id, action) => api.post(`/moderator/comments/${id}`, { action }),
  suspendUser: (id, duration, reason) => api.post(`/moderator/users/${id}/suspend`, { duration, reason }),
};
