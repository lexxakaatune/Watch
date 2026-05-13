import api from './index';

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),
  suspendUser: (id, data) => api.post(`/admin/users/${id}/suspend`, data),
  getCreatorApplications: () => api.get('/admin/creators/applications'),
  approveCreator: (id) => api.post(`/admin/creators/${id}/approve`),
  getReports: () => api.get('/admin/reports'),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}/resolve`, data),
};
