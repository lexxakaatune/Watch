import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../../redux/store'
import VideoCard from '../../components/VideoCard'

export default function UserDashboard() {
  const { user } = useSelector(state => state.auth)
  const [activeTab, setActiveTab] = useState('history')
  const [history, setHistory] = useState([])
  const [watchLater, setWatchLater] = useState([])
  const [playlists, setPlaylists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [histRes, laterRes, playRes] = await Promise.all([
          api.get('/users/history'),
          api.get('/users/watch-later'),
          api.get('/users/playlists')
        ])
        setHistory(histRes.data.data.history || [])
        setWatchLater(laterRes.data.data.videos || [])
        setPlaylists(playRes.data.data.playlists || [])
      } catch (err) {
        console.error('Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
          <div className="sidebar-section">Menu</div>
          <button className={`sidebar-link ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
            History
          </button>
          <button className={`sidebar-link ${activeTab === 'watch-later' ? 'active' : ''}`} onClick={() => setActiveTab('watch-later')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
            Watch Later
          </button>
          <button className={`sidebar-link ${activeTab === 'playlists' ? 'active' : ''}`} onClick={() => setActiveTab('playlists')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            Playlists
          </button>
          <Link to="/messages" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Messages
          </Link>
          <Link to="/notifications" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Notifications
          </Link>
          <div className="sidebar-section mt-4">Account</div>
          <Link to="/settings" className="sidebar-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            Settings
          </Link>
        </aside>

        <div className="dashboard-main">
          <h2 className="text-xl font-bold mb-6 capitalize">{activeTab.replace('-', ' ')}</h2>

          {activeTab === 'history' && (
            <div className="video-grid">
              {history.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
                  No watch history yet
                </div>
              ) : (
                history.map(item => (
                  <VideoCard key={item.video?._id || item._id} video={item.video} />
                ))
              )}
            </div>
          )}

          {activeTab === 'watch-later' && (
            <div className="video-grid">
              {watchLater.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
                  No videos in Watch Later
                </div>
              ) : (
                watchLater.map(video => (
                  <VideoCard key={video._id} video={video} />
                ))
              )}
            </div>
          )}

          {activeTab === 'playlists' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {playlists.length === 0 ? (
                <div className="col-span-full text-center py-12 text-[var(--text-muted)]">
                  No playlists yet
                </div>
              ) : (
                playlists.map(playlist => (
                  <div key={playlist._id} className="card p-4">
                    <h3 className="font-semibold mb-2">{playlist.name}</h3>
                    <p className="text-sm text-[var(--text-muted)]">{playlist.videos?.length || 0} videos</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
