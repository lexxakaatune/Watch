import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { api, setAlert } from '../../redux/store'

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({})
  const [users, setUsers] = useState([])
  const [applications, setApplications] = useState([])
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      const [dashRes, usersRes, appsRes, reportsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users'),
        api.get('/admin/creators/applications'),
        api.get('/admin/reports')
      ])
      setStats(dashRes.data.data.stats || {})
      setUsers(usersRes.data.data.users || [])
      setApplications(appsRes.data.data.applications || [])
      setReports(reportsRes.data.data.reports || [])
    } catch (err) {
      console.error('Failed to load admin dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId, role) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role })
      setUsers(users.map(u => u._id === userId ? { ...u, role } : u))
      dispatch(setAlert({ type: 'success', message: `Role updated to ${role}` }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to update role' }))
    }
  }

  const handleSuspend = async (userId) => {
    try {
      await api.post(`/admin/users/${userId}/suspend`, {})
      dispatch(setAlert({ type: 'success', message: 'User suspended' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to suspend user' }))
    }
  }

  const handleApproveCreator = async (userId, approve) => {
    try {
      await api.post(`/admin/creators/${userId}/approve`, { approve })
      setApplications(applications.filter(a => a._id !== userId))
      dispatch(setAlert({ type: 'success', message: approve ? 'Creator approved' : 'Application rejected' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Action failed' }))
    }
  }

  const handleResolveReport = async (id) => {
    try {
      await api.put(`/admin/reports/${id}/resolve`, { action: 'resolved' })
      setReports(reports.filter(r => r._id !== id))
      dispatch(setAlert({ type: 'success', message: 'Report resolved' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to resolve' }))
    }
  }

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="dashboard-page min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="sidebar-section">Admin Panel</div>
          <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Overview
          </button>
          <button className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Users
          </button>
          <button className={`sidebar-link ${activeTab === 'creators' ? 'active' : ''}`} onClick={() => setActiveTab('creators')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            Creator Applications
          </button>
          <button className={`sidebar-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Reports
          </button>
          <button className={`sidebar-link ${activeTab === 'monetization' ? 'active' : ''}`} onClick={() => setActiveTab('monetization')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Monetization
          </button>
        </aside>

        <div className="dashboard-main">
          <h2 className="text-xl font-bold mb-6">Admin Dashboard</h2>

          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Users</div>
                  <div className="stat-value">{stats.totalUsers?.toLocaleString() || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Videos</div>
                  <div className="stat-value">{stats.totalVideos?.toLocaleString() || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pending Reports</div>
                  <div className="stat-value">{stats.totalReports?.toLocaleString() || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Creator Apps</div>
                  <div className="stat-value">{applications.length}</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="table-container">
                  <div className="table-header">
                    <span className="table-title">Recent Users</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr><th>User</th><th>Role</th><th>Joined</th></tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 5).map(u => (
                        <tr key={u._id}>
                          <td>
                            <div className="flex items-center gap-2">
                              <img src={u.avatar || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                              <span className="font-medium">{u.username}</span>
                            </div>
                          </td>
                          <td><span className="badge badge-green capitalize">{u.role}</span></td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-container">
                  <div className="table-header">
                    <span className="table-title">Recent Videos</span>
                  </div>
                  <table className="data-table">
                    <thead>
                      <tr><th>Title</th><th>Status</th><th>Views</th></tr>
                    </thead>
                    <tbody>
                      {stats.recentVideos?.slice(0, 5).map(v => (
                        <tr key={v._id}>
                          <td className="truncate max-w-[200px]">{v.title}</td>
                          <td><span className={`badge ${v.status === 'ready' ? 'badge-green' : 'badge-amber'}`}>{v.status}</span></td>
                          <td>{v.views?.toLocaleString()}</td>
                        </tr>
                      )) || <tr><td colSpan="3" className="text-center py-4 text-[var(--text-muted)]">No videos</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <div className="table-header mb-4">
                <span className="table-title">All Users</span>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <img src={u.avatar || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium">{u.username}</span>
                          </div>
                        </td>
                        <td className="text-[var(--text-muted)]">{u.email}</td>
                        <td>
                          <select 
                            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
                            value={u.role}
                            onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="premium_user">Premium</option>
                            <option value="creator">Creator</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>
                          <button className="text-[var(--error)] text-sm" onClick={() => handleSuspend(u._id)}>Suspend</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'creators' && (
            <>
              <h3 className="text-lg font-bold mb-4">Pending Creator Applications</h3>
              {applications.length === 0 ? (
                <div className="card p-6 text-center text-[var(--text-muted)]">No pending applications</div>
              ) : (
                applications.map(app => (
                  <div key={app._id} className="queue-item">
                    <img src={app.avatar || '/default-avatar.png'} alt="" className="w-12 h-12 rounded-full object-cover" />
                    <div className="queue-info">
                      <h4 className="font-semibold">{app.username}</h4>
                      <p className="text-sm text-[var(--text-muted)]">{app.email}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{app.creatorApplication?.reason || 'No reason provided'}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">Applied: {new Date(app.creatorApplication?.appliedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="queue-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => handleApproveCreator(app._id, true)}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleApproveCreator(app._id, false)}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'reports' && (
            <>
              <h3 className="text-lg font-bold mb-4">All Reports</h3>
              {reports.length === 0 ? (
                <div className="card p-6 text-center text-[var(--text-muted)]">No pending reports</div>
              ) : (
                reports.map(report => (
                  <div key={report._id} className="queue-item">
                    <div className="queue-info">
                      <h4 className="font-semibold">{report.reason}</h4>
                      <p className="text-sm text-[var(--text-muted)]">Type: {report.targetType} | By: {report.reporter?.username}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="queue-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => handleResolveReport(report._id)}>Resolve</button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {activeTab === 'monetization' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Monetization Overview</h3>
              <p className="text-[var(--text-secondary)]">Monetization features will be configured here. This includes ad campaigns, payout settings, and revenue analytics.</p>
              <div className="stats-grid mt-6">
                <div className="stat-card">
                  <div className="stat-label">Total Ad Revenue</div>
                  <div className="stat-value">$0.00</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active Campaigns</div>
                  <div className="stat-value">0</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
