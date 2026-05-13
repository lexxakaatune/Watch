import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { userAPI } from '../api/user';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton } from '../components/Skeletons';
import { HistoryIcon, WatchLaterIcon, PlaylistIcon, HeartIcon, SettingsIcon, UserIcon } from '../components/Icons';

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [hRes, wRes, pRes] = await Promise.all([
          userAPI.getHistory(),
          userAPI.getWatchLater(),
          userAPI.getPlaylists(),
        ]);
        setHistory(hRes.data.data?.history || []);
        setWatchLater(wRes.data.data?.watchLater || []);
        setPlaylists(pRes.data.data?.playlists || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const tabs = [
    { id: 'history', label: 'History', icon: HistoryIcon },
    { id: 'watchlater', label: 'Watch Later', icon: WatchLaterIcon },
    { id: 'playlists', label: 'Playlists', icon: PlaylistIcon },
    { id: 'liked', label: 'Liked Videos', icon: HeartIcon },
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="video-grid">
          {[1, 2, 3, 4].map(i => <VideoSkeleton key={i} />)}
        </div>
      );
    }

    switch (activeTab) {
      case 'history':
        return history.length > 0 ? (
          <div className="video-grid">
            {history.map(item => (
              <VideoCard key={item.video?._id} video={item.video} showProgress progress={item.progress} />
            ))}
          </div>
        ) : <EmptyState icon="📺" title="No watch history" desc="Videos you watch will appear here" />;

      case 'watchlater':
        return watchLater.length > 0 ? (
          <div className="video-grid">
            {watchLater.map(video => <VideoCard key={video._id} video={video} />)}
          </div>
        ) : <EmptyState icon="⏰" title="Watch Later is empty" desc="Save videos to watch later" />;

      case 'playlists':
        return playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playlists.map(playlist => (
              <div key={playlist._id} className="playlist-card">
                <div className="playlist-thumb">
                  <img src={playlist.videos?.[0]?.thumbnail || '/placeholder-video.jpg'} alt="" />
                  <div className="playlist-count">
                    <PlaylistIcon size={14} /> {playlist.videos?.length || 0}
                  </div>
                </div>
                <div className="playlist-info">
                  <h4 className="playlist-title">{playlist.name}</h4>
                  <p className="playlist-meta">{playlist.isPublic ? 'Public' : 'Private'} • {playlist.videos?.length || 0} videos</p>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState icon="📁" title="No playlists" desc="Create your first playlist" />;

      case 'liked':
        return <EmptyState icon="❤️" title="No liked videos" desc="Videos you like will appear here" />;

      default:
        return null;
    }
  };

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div className="profile-banner"></div>
        <div className="profile-header-content container">
          <img src={user?.avatar || '/default-avatar.png'} alt="" className="profile-avatar-xl" />
          <div className="profile-info">
            <h1 className="profile-name">{user?.username}</h1>
            <p className="profile-handle">@{user?.username}</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{user?.totalSubscribers || 0}</span>
                <span className="profile-stat-label">Subscribers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{user?.totalViews || 0}</span>
                <span className="profile-stat-label">Views</span>
              </div>
            </div>
          </div>
          <div className="profile-actions">
            <Link to="/settings" className="action-btn">
              <SettingsIcon size={16} /> Edit Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="profile-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
        <div className="py-6">
          {renderContent()}
        </div>
      </div>
    </main>
  );
}

function EmptyState({ icon, title, desc }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-desc">{desc}</p>
    </div>
  );
}
