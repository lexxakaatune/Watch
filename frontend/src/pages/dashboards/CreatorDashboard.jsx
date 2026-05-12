import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { api, setAlert } from '../../redux/store'

export default function CreatorDashboard() {
  const dispatch = useDispatch()
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({})
  const [videos, setVideos] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, analyticsRes] = await Promise.all([
          api.get('/creator/dashboard'),
          api.get('/creator/analytics')
        ])
        setStats(dashRes.data.data.stats || {})
        setVideos(dashRes.data.data.videos || [])
        setAnalytics(analyticsRes.data.data || {})
      } catch (err) {
        console.error('Failed to load creator dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDelete = async (videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return
    try {
      await api.delete(`/creator/videos/${videoId}`)
      setVideos(videos.filter(v => v._id !== videoId))
      dispatch(setAlert({ type: 'success', message: 'Video deleted' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to delete video' }))
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
          <div className="sidebar-section">Creator Studio</div>
          <button className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Overview
          </button>
          <button className={`sidebar-link ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/></svg>
            Content
          </button>
          <button className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            Analytics
          </button>
          <button className={`sidebar-link ${activeTab === 'earnings' ? 'active' : ''}`} onClick={() => setActiveTab('earnings')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Earnings
          </button>
          <div className="sidebar-section mt-4">Actions</div>
          <Link to="/upload" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload Video
          </Link>
        </aside>

        <div className="dashboard-main">
          {activeTab === 'overview' && (
            <>
              <h2 className="text-xl font-bold mb-6">Channel Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Views</div>
                  <div className="stat-value">{stats.totalViews?.toLocaleString() || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Videos</div>
                  <div className="stat-value">{stats.totalVideos || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Subscribers</div>
                  <div className="stat-value">{stats.totalSubscribers?.toLocaleString() || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Earnings</div>
                  <div className="stat-value">${stats.earnings?.toFixed(2) || '0.00'}</div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-bold mb-4">Recent Videos</h3>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Video</th>
                        <th>Views</th>
                        <th>Likes</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.slice(0, 5).map(video => (
                        <tr key={video._id}>
                          <td>
                            <div className="flex items-center gap-3">
                              <img src={video.thumbnail} alt="" className="w-20 aspect-video object-cover rounded" />
                              <span className="font-medium truncate max-w-[200px]">{video.title}</span>
                            </div>
                          </td>
                          <td>{video.views?.toLocaleString()}</td>
                          <td>{video.likes?.length || 0}</td>
                          <td><span className={`badge ${video.status === 'ready' ? 'badge-green' : video.status === 'processing' ? 'badge-amber' : 'badge-red'}`}>{video.status}</span></td>
                          <td>
                            <Link to={`/watch/${video._id}`} className="text-[var(--primary)] text-sm mr-3">View</Link>
                            <button onClick={() => handleDelete(video._id)} className="text-[var(--error)] text-sm">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {activeTab === 'content' && (
            <>
              <h2 className="text-xl font-bold mb-6">Your Videos</h2>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Visibility</th>
                      <th>Views</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map(video => (
                      <tr key={video._id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <img src={video.thumbnail} alt="" className="w-20 aspect-video object-cover rounded" />
                            <span className="font-medium truncate max-w-[200px]">{video.title}</span>
                          </div>
                        </td>
                        <td className="capitalize">{video.visibility}</td>
                        <td>{video.views?.toLocaleString()}</td>
                        <td><span className={`badge ${video.status === 'ready' ? 'badge-green' : video.status === 'processing' ? 'badge-amber' : 'badge-red'}`}>{video.status}</span></td>
                        <td>{new Date(video.createdAt).toLocaleDateString()}</td>
                        <td>
                          <Link to={`/watch/${video._id}`} className="text-[var(--primary)] text-sm mr-3">View</Link>
                          <button onClick={() => handleDelete(video._id)} className="text-[var(--error)] text-sm">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <>
              <h2 className="text-xl font-bold mb-6">Channel Analytics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Last 30 Days Views</div>
                  <div className="stat-value">
                    {Object.values(analytics.dailyViews || {}).reduce((a, b) => a + b, 0).toLocaleString()}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Videos This Month</div>
                  <div className="stat-value">{analytics.videos?.length || 0}</div>
                </div>
              </div>
              <div className="mt-8 card p-6">
                <h3 className="text-lg font-bold mb-4">Daily Views (Last 30 Days)</h3>
                <div className="space-y-2">
                  {Object.entries(analytics.dailyViews || {}).map(([date, views]) => (
                    <div key={date} className="flex items-center gap-4">
                      <span className="text-sm text-[var(--text-muted)] w-24">{date}</span>
                      <div className="flex-1 bg-[var(--bg-secondary)] rounded-full h-4 overflow-hidden">
                        <div 
                          className="h-full bg-[var(--primary)] rounded-full transition-all"
                          style={{ width: `${Math.min((views / (Math.max(...Object.values(analytics.dailyViews || {0:1}))) * 100), 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-16 text-right">{views}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'earnings' && (
            <>
              <h2 className="text-xl font-bold mb-6">Earnings</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Earnings</div>
                  <div className="stat-value">${stats.earnings?.toFixed(2) || '0.00'}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pending</div>
                  <div className="stat-value">$0.00</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Paid Out</div>
                  <div className="stat-value">$0.00</div>
                </div>
              </div>
              <div className="mt-8 card p-6 text-center">
                <p className="text-[var(--text-muted)]">Earnings will be calculated based on views, engagement, and ad revenue.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
