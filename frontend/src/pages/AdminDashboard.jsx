import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import {
  DashboardIcon, UsersIcon, CrownIcon, FlagIcon, DollarIcon,
  CheckIcon, XIcon, BanIcon, ShieldIcon, SearchIcon
} from '../components/Icons';
import { formatTimeAgo } from '../utils/constants';
import Alert from '../components/Alert';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [uRes, aRes, rRes] = await Promise.all([
          adminAPI.getUsers(),
          adminAPI.getCreatorApplications(),
          adminAPI.getReports(),
        ]);
        setUsers(uRes.data.data?.users || []);
        setApplications(aRes.data.data?.applications || []);
        setReports(rRes.data.data?.reports || []);
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to load admin data' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleUpdateRole = async (id, role) => {
    try {
      await adminAPI.updateUserRole(id, role);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      setAlert({ type: 'success', message: 'Role updated successfully' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to update role' });
    }
  };

  const handleApproveCreator = async (id) => {
    try {
      await adminAPI.approveCreator(id);
      setApplications(prev => prev.filter(a => a._id !== id));
      setAlert({ type: 'success', message: 'Creator approved' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to approve' });
    }
  };

  const handleSuspend = async (id) => {
    try {
      await adminAPI.suspendUser(id, { duration: 7, reason: 'Violation of terms' });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u));
      setAlert({ type: 'success', message: 'User suspended' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to suspend' });
    }
  };

  const filteredUsers = users.filter(u =>
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Users', value: users.length, icon: UsersIcon, color: 'blue' },
    { label: 'Pending Apps', value: applications.length, icon: CrownIcon, color: 'amber' },
    { label: 'Reports', value: reports.length, icon: FlagIcon, color: 'red' },
    { label: 'Revenue', value: '$0', icon: DollarIcon, color: 'green' },
  ];

  return (
    <main className="dashboard-page">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <p className="dashboard-sidebar-title">Admin Panel</p>
          <nav className="dashboard-nav">
            <button onClick={() => setActiveTab('overview')} className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <DashboardIcon size={18} /> Overview
            </button>
            <button onClick={() => setActiveTab('users')} className={`dashboard-nav-item ${activeTab === 'users' ? 'active' : ''}`}>
              <UsersIcon size={18} /> Users
            </button>
            <button onClick={() => setActiveTab('creators')} className={`dashboard-nav-item ${activeTab === 'creators' ? 'active' : ''}`}>
              <CrownIcon size={18} /> Creator Apps
            </button>
            <button onClick={() => setActiveTab('reports')} className={`dashboard-nav-item ${activeTab === 'reports' ? 'active' : ''}`}>
              <FlagIcon size={18} /> Reports
            </button>
          </nav>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-header-title">Admin Dashboard</h1>
            <p className="dashboard-header-subtitle">Manage platform and users</p>
          </div>

          {activeTab === 'overview' && (
            <div className="stats-grid">
              {stats.map((stat, i) => (
                <div key={i} className="stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">{stat.label}</span>
                    <div className={`stat-card-icon ${stat.color}`}><stat.icon size={20} /></div>
                  </div>
                  <div className="stat-card-value">{stat.value}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="data-table-container">
              <div className="data-table-header">
                <h3 className="data-table-title">User Management</h3>
                <div className="data-table-search">
                  <SearchIcon size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              {loading ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user._id}>
                        <td>
                          <div className="table-user">
                            <img src={user.avatar || '/default-avatar.png'} alt="" className="table-user-avatar" />
                            <div className="table-user-info">
                              <span className="table-user-name">{user.username}</span>
                              <span className="table-user-email">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className={`table-role ${user.role}`}>{user.role}</span></td>
                        <td><span className={`badge badge-${user.isActive ? 'success' : 'error'}`}>{user.isActive ? 'Active' : 'Suspended'}</span></td>
                        <td>{formatTimeAgo(user.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <select
                              value={user.role}
                              onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                              className="form-input text-xs py-1"
                              style={{ width: 120 }}
                            >
                              <option value="user">User</option>
                              <option value="premium_user">Premium</option>
                              <option value="creator">Creator</option>
                              <option value="moderator">Moderator</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button onClick={() => handleSuspend(user._id)} className="table-action-btn danger"><BanIcon size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'creators' && (
            <div className="data-table-container">
              <div className="data-table-header">
                <h3 className="data-table-title">Creator Applications</h3>
              </div>
              {applications.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>No pending applications</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Reason</th>
                      <th>Applied</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map(app => (
                      <tr key={app._id}>
                        <td>
                          <div className="table-user">
                            <img src={app.user?.avatar || '/default-avatar.png'} alt="" className="table-user-avatar" />
                            <span className="table-user-name">{app.user?.username}</span>
                          </div>
                        </td>
                        <td>{app.reason || 'No reason provided'}</td>
                        <td>{formatTimeAgo(app.appliedAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleApproveCreator(app.user?._id)} className="table-action-btn" style={{ color: 'var(--primary)' }}>
                              <CheckIcon size={16} />
                            </button>
                            <button className="table-action-btn danger"><XIcon size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="data-table-container">
              <div className="data-table-header">
                <h3 className="data-table-title">Reports</h3>
              </div>
              {reports.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>No reports</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Reporter</th>
                      <th>Reason</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report._id}>
                        <td><span className="badge badge-warning">{report.type}</span></td>
                        <td>{report.reporter?.username}</td>
                        <td>{report.reason}</td>
                        <td>{formatTimeAgo(report.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
