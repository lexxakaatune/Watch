import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../redux/store'
import VideoCard from '../components/VideoCard'

export default function Profile() {
  const { username } = useParams()
  const { user: currentUser, isAuthenticated } = useSelector(state => state.auth)
  const [profile, setProfile] = useState(null)
  const [videos, setVideos] = useState([])
  const [activeTab, setActiveTab] = useState('videos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/profile/${username}`)
        setProfile(res.data.data.user)
        setVideos(res.data.data.videos || [])
      } catch (err) {
        console.error('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [username])

  if (loading) {
    return (
      <div className="profile-page min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">User not found</h2>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  const isOwnProfile = isAuthenticated && currentUser?.username === username

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-banner" />
        <div className="profile-info container">
          <img src={profile.avatar || '/default-avatar.png'} alt={profile.username} className="profile-avatar-lg" />
          <div className="profile-details">
            <h1 className="profile-name">{profile.username}</h1>
            <p className="profile-handle">@{profile.username}</p>
            <div className="profile-stats">
              <span><strong>{profile.totalSubscribers?.toLocaleString() || 0}</strong> subscribers</span>
              <span><strong>{videos.length}</strong> videos</span>
              <span><strong>{profile.totalViews?.toLocaleString() || 0}</strong> views</span>
            </div>
            {!isOwnProfile && isAuthenticated && (
              <div className="profile-actions">
                <button className="btn btn-primary">Subscribe</button>
                <Link to={`/messages`} className="btn btn-secondary">Message</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="profile-tabs container">
        <button className={`profile-tab ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
          Videos
        </button>
        <button className={`profile-tab ${activeTab === 'playlists' ? 'active' : ''}`} onClick={() => setActiveTab('playlists')}>
          Playlists
        </button>
        <button className={`profile-tab ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          About
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'videos' && (
          <div className="video-grid">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
        {activeTab === 'playlists' && (
          <div className="text-center py-12">
            <p className="text-[var(--text-muted)]">No playlists yet</p>
          </div>
        )}
        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <div className="card p-6">
              <h3 className="text-lg font-bold mb-4">Channel Details</h3>
              <p className="text-[var(--text-secondary)]">Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
