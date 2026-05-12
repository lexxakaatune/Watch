import { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { api, setAlert } from '../../redux/store'

export default function ModeratorDashboard() {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('queue')
  const [stats, setStats] = useState({})
  const [reports, setReports] = useState([])
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, reportsRes, uploadsRes] = await Promise.all([
          api.get('/moderator/dashboard'),
          api.get('/admin/reports'),
          api.get('/moderator/uploads')
        ])
        setStats(dashRes.data.data.stats || {})
        setReports(reportsRes.data.data.reports || [])
        setVideos(uploadsRes.data.data.videos || [])
      } catch (err) {
        console.error('Failed to load moderator dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleModerateVideo = async (id, action) => {
    try {
      await api.post(`/moderator/videos/${id}`, { action })
      setVideos(videos.filter(v => v._id !== id))
      dispatch(setAlert({ type: 'success', message: `Video ${action}d` }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Action failed' }))
    }
  }

  const handleResolveReport = async (id) => {
    try {
      await api.put(`/admin/reports/${id}/resolve`, { action: 'reviewed' })
      setReports(reports.filter(r => r._id !== id))
      dispatch(setAlert({ type: 'success', message: 'Report resolved' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to resolve' }))
    }
  }

  const handleSuspendUser = async (userId, hours) => {
    try {
      await api.post(`/moderator/users/${userId}/suspend`, { duration: hours })
      dispatch(setAlert({ type: 'success', message: `User suspended for ${hours} hours` }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to suspend user' }))
    }
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
          <div className="sidebar-section">Moderation</div>
          <button className={`sidebar-link ${activeTab === 'queue' ? 'active' : ''}`} onClick={() => setActiveTab('queue')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Reports Queue
          </button>
          <button className={`sidebar-link ${activeTab === 'uploads' ? 'active' : ''}`} onClick={() => setActiveTab('uploads')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
            Pending Uploads
          </button>
          <button className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            User Actions
          </button>
        </aside>

        <div className="dashboard-main">
          <h2 className="text-xl font-bold mb-6">Moderator Dashboard</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Pending Reports</div>
              <div className="stat-value">{stats.pendingReports || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Flagged Videos</div>
              <div className="stat-value">{stats.flaggedVideos || 0}</div>
            </div>
          </div>

          {activeTab === 'queue' && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Reports Queue</h3>
              {reports.length === 0 ? (
                <div className="card p-6 text-center text-[var(--text-muted)]">No pending reports</div>
              ) : (
                reports.map(report => (
                  <div key={report._id} className="queue-item">
                    <div className="queue-info">
                      <h4 className="font-semibold">{report.reason}</h4>
                      <p className="text-sm text-[var(--text-muted)]">Reported by {report.reporter?.username} on {new Date(report.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">Type: {report.targetType}</p>
                    </div>
                    <div className="queue-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => handleResolveReport(report._id)}>Resolve</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => handleResolveReport(report._id)}>Dismiss</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Pending Uploads</h3>
              {videos.length === 0 ? (
                <div className="card p-6 text-center text-[var(--text-muted)]">No pending uploads</div>
              ) : (
                videos.map(video => (
                  <div key={video._id} className="queue-item">
                    <div className="queue-thumb">
                      <img src={video.thumbnail} alt="" />
                    </div>
                    <div className="queue-info">
                      <h4 className="font-semibold truncate">{video.title}</h4>
                      <p className="text-sm text-[var(--text-muted)]">By {video.creator?.username}</p>
                      <span className={`badge ${video.status === 'processing' ? 'badge-amber' : 'badge-red'} mt-1`}>{video.status}</span>
                    </div>
                    <div className="queue-actions">
                      <button className="btn btn-sm btn-primary" onClick={() => handleModerateVideo(video._id, 'approve')}>Approve</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleModerateVideo(video._id, 'reject')}>Reject</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">Temporary Suspensions</h3>
              <div className="card p-6">
                <p className="text-[var(--text-secondary)] mb-4">Enter a user ID to suspend them temporarily (max 7 days).</p>
                <div className="flex gap-3">
                  <input type="text" placeholder="User ID" className="form-input flex-1" id="suspend-user-id" />
                  <input type="number" placeholder="Hours (1-168)" className="form-input w-32" min="1" max="168" id="suspend-hours" />
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      const uid = document.getElementById('suspend-user-id').value
                      const hours = parseInt(document.getElementById('suspend-hours').value)
                      if (uid && hours) handleSuspendUser(uid, hours)
                    }}
                  >
                    Suspend
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
