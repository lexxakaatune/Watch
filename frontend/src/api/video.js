import api from './index';

export const videoAPI = {
  getFeed: (params) => api.get('/videos/feed', { params }),
  getTrending: () => api.get('/videos/trending'),
  getVideo: (id) => api.get(`/videos/${id}`),
  likeVideo: (id) => api.post(`/videos/${id}/like`),
  dislikeVideo: (id) => api.post(`/videos/${id}/dislike`),
  reportVideo: (id, reason) => api.post(`/videos/${id}/report`, { reason }),
  streamVideo: (key) => `${api.defaults.baseURL}/videos/stream/${encodeURIComponent(key)}`,
};
