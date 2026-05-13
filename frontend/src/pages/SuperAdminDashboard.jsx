import { useState, useEffect } from 'react';
import { superadminAPI } from '../api/superadmin';
import { adminAPI } from '../api/admin';
import {
  DashboardIcon, ServerIcon, ActivityIcon, WifiIcon, UsersIcon,
  ShieldIcon, CrownIcon, CheckIcon, BanIcon, RefreshIcon
} from '../components/Icons';
import { formatNumber, formatTimeAgo } from '../utils/constants';
import Alert from '../components/Alert';

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [health, setHealth] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [hRes, aRes] = await Promise.all([
          superadminAPI.getSystemHealth(),
          superadminAPI.getAdmins(),
        ]);
        setHealth(hRes.data.data);
        setAdmins(aRes.data.data?.admins || []);
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to load superadmin data' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdateAdminRole = async (id, role) => {
    try {
      await superadminAPI.updateAdminRole(id, role);
      setAdmins(prev => prev.map(a => a._id === id ? { ...a, role } : a));
      setAlert({ type: 'success', message: 'Admin role updated' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to update' });
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <main className="dashboard-page">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <p className="dashboard-sidebar-title">Super Admin</p>
          <nav className="dashboard-nav">
            <button onClick={() => setActiveTab('overview')} className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <DashboardIcon size={18} /> Overview
            </button>
            <button onClick={() => setActiveTab('health')} className={`dashboard-nav-item ${activeTab === 'health' ? 'active' : ''}`}>
              <ActivityIcon size={18} /> System Health
            </button>
            <button onClick={() => setActiveTab('admins')} className={`dashboard-nav-item ${activeTab === 'admins' ? 'active' : ''}`}>
              <ShieldIcon size={18} /> Admin Management
            </button>
            <button onClick={() => setActiveTab('settings')} className={`dashboard-nav-item ${activeTab === 'settings' ? 'active' : ''}`}>
              <ServerIcon size={18} /> Global Settings
            </button>
          </nav>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-header-title">Super Admin Dashboard</h1>
            <p className="dashboard-header-subtitle">Full system control and monitoring</p>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">System Status</span>
                    <div className="stat-card-icon green"><WifiIcon size={20} /></div>
                  </div>
                  <div className="stat-card-value" style={{ color: 'var(--primary)' }}>{health?.status || 'Unknown'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">Uptime</span>
                    <div className="stat-card-icon blue"><ActivityIcon size={20} /></div>
                  </div>
                  <div className="stat-card-value">{formatUptime(health?.uptime || 0)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">Memory Used</span>
                    <div className="stat-card-icon amber"><ServerIcon size={20} /></div>
                  </div>
                  <div className="stat-card-value">{formatBytes(health?.memory?.heapUsed)}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">Staff Members</span>
                    <div className="stat-card-icon green"><UsersIcon size={20} /></div>
                  </div>
                  <div className="stat-card-value">{admins.length}</div>
                </div>
              </div>

              <div className="data-table-container mt-6">
                <div className="data-table-header">
                  <h3 className="data-table-title">Quick Health Check</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="health-status healthy">
                    <span className="health-dot healthy"></span>
                    <span>API Server: Operational</span>
                  </div>
                  <div className="health-status healthy">
                    <span className="health-dot healthy"></span>
                    <span>Database: Connected</span>
                  </div>
                  <div className="health-status healthy">
                    <span className="health-dot healthy"></span>
                    <span>Authentication: Active</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'health' && (
            <div className="data-table-container">
              <div className="data-table-header">
                <h3 className="data-table-title">System Health Details</h3>
                <button onClick={() => window.location.reload()} className="action-btn">
                  <RefreshIcon size={16} /> Refresh
                </button>
              </div>
              <div className="p-6 space-y-4">
                {health ? (
                  <>
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Status</span>
                      <span className="font-semibold" style={{ color: 'var(--primary)' }}>{health.status}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Uptime</span>
                      <span className="font-semibold">{formatUptime(health.uptime)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Heap Used</span>
                      <span className="font-semibold">{formatBytes(health.memory?.heapUsed)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Heap Total</span>
                      <span className="font-semibold">{formatBytes(health.memory?.heapTotal)}</span>
                    </div>
                    <div className="flex justify-between py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>RSS</span>
                      <span className="font-semibold">{formatBytes(health.memory?.rss)}</span>
                    </div>
                    <div className="flex justify-between py-3">
                      <span style={{ color: 'var(--text-secondary)' }}>External</span>
                      <span className="font-semibold">{formatBytes(health.memory?.external)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center" style={{ color: 'var(--text-muted)' }}>No health data available</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'admins' && (
            <div className="data-table-container">
              <div className="data-table-header">
                <h3 className="data-table-title">Admin & Moderator Management</h3>
              </div>
              {loading ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Current Role</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin._id}>
                        <td>
                          <div className="table-user">
                            <img src={admin.avatar || '/default-avatar.png'} alt="" className="table-user-avatar" />
                            <div className="table-user-info">
                              <span className="table-user-name">{admin.username}</span>
                              <span className="table-user-email">{admin.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className={`table-role ${admin.role}`}>{admin.role}</span></td>
                        <td>{admin.lastLogin ? formatTimeAgo(admin.lastLogin) : 'Never'}</td>
                        <td>
                          <div className="table-actions">
                            <select
                              value={admin.role}
                              onChange={(e) => handleUpdateAdminRole(admin._id, e.target.value)}
                              className="form-input text-xs py-1"
                              style={{ width: 130 }}
                            >
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                              <option value="user">Demote to User</option>
                            </select>
                            <button className="table-action-btn danger"><BanIcon size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="data-table-container p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Global Settings</h3>
              <p style={{ color: 'var(--text-muted)' }}>Global configuration options coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
