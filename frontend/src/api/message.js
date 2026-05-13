import api from './index';

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  sendMessage: (userId, text) => api.post(`/messages/${userId}`, { text }),
};
