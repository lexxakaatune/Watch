import api from './index';

export const commentAPI = {
  getComments: (videoId) => api.get(`/comments/${videoId}`),
  addComment: (videoId, text, parentId) => api.post(`/comments/${videoId}`, { text, parentId }),
  likeComment: (id) => api.post(`/comments/${id}/like`),
  pinComment: (id) => api.post(`/comments/${id}/pin`),
  reportComment: (id, reason) => api.post(`/comments/${id}/report`, { reason }),
};
