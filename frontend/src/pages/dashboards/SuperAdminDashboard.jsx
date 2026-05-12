import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { api, setAlert } from '../../redux/store'

export default function SuperAdminDashboard() {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('system')
  const [systemHealth, setSystemHealth] = useState(null)
  const [admins, setAdmins] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthRes, adminsRes, usersRes] = await Promise.all([
          api.get('/superadmin/system-health'),
          api.get('/superadmin/admins'),
          api.get('/admin/users')
        ])
        setSystemHealth(healthRes.data.data)
        setAdmins(adminsRes.data.data.admins || [])
        setUsers(usersRes.data.data.users || [])
      } catch (err) {
        console.error('Failed to load superadmin dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleUpdateAdminRole = async (userId, role) => {
    try {
      await api.put(`/superadmin/admins/${userId}/role`, { role })
      setAdmins(admins.map(a => a._id === userId ? { ...a, role } : a))
      dispatch(setAlert({ type: 'success', message: `Role updated to ${role}` }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to update role' }))
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${mins}m`
  }

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
          <div className="sidebar-section">Super Admin</div>
          <button className={`sidebar-link ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            System Health
          </button>
          <button className={`sidebar-link ${activeTab === 'admins' ? 'active' : ''}`} onClick={() => setActiveTab('admins')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Admin Management
          </button>
          <button className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            All Users
          </button>
          <button className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Global Settings
          </button>
        </aside>

        <div className="dashboard-main">
          <h2 className="text-xl font-bold mb-6">Super Admin Dashboard</h2>

          {activeTab === 'system' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">System Status</div>
                  <div className="stat-value text-[var(--primary)]">{systemHealth?.status || 'Unknown'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Uptime</div>
                  <div className="stat-value">{systemHealth ? formatUptime(systemHealth.uptime) : 'N/A'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Memory Used</div>
                  <div className="stat-value">{systemHealth?.memory ? formatBytes(systemHealth.memory.heapUsed) : 'N/A'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Memory</div>
                  <div className="stat-value">{systemHealth?.memory ? formatBytes(systemHealth.memory.heapTotal) : 'N/A'}</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                  <h3 className="text-lg font-bold mb-4">Memory Breakdown</h3>
                  {systemHealth?.memory && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-secondary)]">RSS</span>
                          <span className="font-medium">{formatBytes(systemHealth.memory.rss)}</span>
                        </div>
                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
                          <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '60%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-secondary)]">Heap Used</span>
                          <span className="font-medium">{formatBytes(systemHealth.memory.heapUsed)}</span>
                        </div>
                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
                          <div className="h-full bg-[var(--warning)] rounded-full" style={{ width: '45%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-secondary)]">Heap Total</span>
                          <span className="font-medium">{formatBytes(systemHealth.memory.heapTotal)}</span>
                        </div>
                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
                          <div className="h-full bg-[var(--primary)] rounded-full" style={{ width: '50%' }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[var(--text-secondary)]">External</span>
                          <span className="font-medium">{formatBytes(systemHealth.memory.external)}</span>
                        </div>
                        <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2">
                          <div className="h-full bg-[var(--text-muted)] rounded-full" style={{ width: '20%' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="card p-6">
                  <h3 className="text-lg font-bold mb-4">Infrastructure</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-[var(--text-secondary)]">Node.js Version</span>
                      <span className="font-medium">{process?.versions?.node || '18.x'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-[var(--text-secondary)]">Platform</span>
                      <span className="font-medium">{process?.platform || 'linux'}</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-[var(--text-secondary)]">Environment</span>
                      <span className="badge badge-green">Production</span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[var(--text-secondary)]">Database</span>
                      <span className="badge badge-green">MongoDB Atlas</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'admins' && (
            <>
              <h3 className="text-lg font-bold mb-4">Admin & Moderator Management</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Current Role</th><th>Change Role</th></tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <img src={admin.avatar || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium">{admin.username}</span>
                          </div>
                        </td>
                        <td className="text-[var(--text-muted)]">{admin.email}</td>
                        <td><span className="badge badge-green capitalize">{admin.role}</span></td>
                        <td>
                          <select
                            className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded px-2 py-1 text-sm text-[var(--text-primary)]"
                            value={admin.role}
                            onChange={(e) => handleUpdateAdminRole(admin._id, e.target.value)}
                          >
                            <option value="user">User</option>
                            <option value="premium_user">Premium</option>
                            <option value="creator">Creator</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <>
              <h3 className="text-lg font-bold mb-4">All Platform Users</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th></tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id}>
                        <td>
                          <div className="flex items-center gap-2">
                            <img src={u.avatar || '/default-avatar.png'} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <span className="font-medium">{u.username}</span>
                          </div>
                        </td>
                        <td className="text-[var(--text-muted)]">{u.email}</td>
                        <td><span className="badge badge-green capitalize">{u.role}</span></td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                            {u.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Global Settings</h3>
              <p className="text-[var(--text-secondary)] mb-6">Configure platform-wide settings. Changes apply immediately.</p>
              <div className="space-y-4">
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Registration Open</div>
                    <div className="settings-desc">Allow new user registrations</div>
                  </div>
                  <div className="toggle active"><div className="toggle-knob" /></div>
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Creator Applications</div>
                    <div className="settings-desc">Allow users to apply for creator status</div>
                  </div>
                  <div className="toggle active"><div className="toggle-knob" /></div>
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Maintenance Mode</div>
                    <div className="settings-desc">Put site in maintenance mode</div>
                  </div>
                  <div className="toggle"><div className="toggle-knob" /></div>
                </div>
                <div className="settings-row">
                  <div>
                    <div className="settings-label">Email Verification Required</div>
                    <div className="settings-desc">Require email verification for new accounts</div>
                  </div>
                  <div className="toggle active"><div className="toggle-knob" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
