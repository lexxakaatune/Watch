import api from './index';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  verify2FA: (data) => api.post('/auth/2fa/verify', data),
  setup2FA: () => api.post('/auth/2fa/setup'),
  confirm2FA: (data) => api.post('/auth/2fa/confirm', data),
  refresh: () => api.post('/auth/refresh'),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};
