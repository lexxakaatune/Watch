import api from './index';

export const superadminAPI = {
  getSystemHealth: () => api.get('/superadmin/system-health'),
  getAdmins: () => api.get('/superadmin/admins'),
  updateAdminRole: (id, role) => api.put(`/superadmin/admins/${id}/role`, { role }),
};
