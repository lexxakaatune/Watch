import api from './index';

export const userAPI = {
  getProfile: (username) => api.get(`/users/profile/${username}`),
  updateProfile: (data) => api.put('/users/profile', data),
  getHistory: () => api.get('/users/history'),
  addToHistory: (videoId, progress) => api.post('/users/history', { videoId, progress }),
  getWatchLater: () => api.get('/users/watch-later'),
  toggleWatchLater: (videoId) => api.post('/users/watch-later', { videoId }),
  getPlaylists: () => api.get('/users/playlists'),
  createPlaylist: (data) => api.post('/users/playlists', data),
  subscribe: (channelId) => api.post('/users/subscribe', { channelId }),
  applyCreator: () => api.post('/users/apply-creator'),
};
