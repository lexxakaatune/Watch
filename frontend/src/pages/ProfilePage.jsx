import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userAPI } from '../api/user';
import { videoAPI } from '../api/video';
import { useAuth } from '../hooks/useAuth';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton } from '../components/Skeletons';
import { formatNumber } from '../utils/constants';
import { UserIcon, UsersIcon, EyeIcon, HeartIcon, PlusIcon } from '../components/Icons';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const [pRes, vRes] = await Promise.all([
          userAPI.getProfile(username),
          videoAPI.getFeed({ creator: username }),
        ]);
        setProfile(pRes.data.data?.user);
        setVideos(vRes.data.data?.videos || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  const handleSubscribe = async () => {
    if (!profile) return;
    try {
      await userAPI.subscribe(profile._id);
      setSubscribed(!subscribed);
    } catch (err) {
      console.error(err);
    }
  };

  const isOwnProfile = currentUser?.username === username;

  if (!profile && !loading) {
    return (
      <main className="profile-page">
        <div className="container py-12 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>User not found</h1>
          <p style={{ color: 'var(--text-muted)' }}>The user @{username} does not exist</p>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-header">
        <div className="profile-banner"></div>
        <div className="profile-header-content container">
          <img src={profile?.avatar || '/default-avatar.png'} alt="" className="profile-avatar-xl" />
          <div className="profile-info">
            <h1 className="profile-name">{profile?.username}</h1>
            <p className="profile-handle">@{profile?.username}</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{formatNumber(profile?.totalSubscribers || 0)}</span>
                <span className="profile-stat-label">Subscribers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{formatNumber(videos.length)}</span>
                <span className="profile-stat-label">Videos</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{formatNumber(profile?.totalViews || 0)}</span>
                <span className="profile-stat-label">Views</span>
              </div>
            </div>
          </div>
          {!isOwnProfile && (
            <div className="profile-actions">
              <button onClick={handleSubscribe} className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`}>
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container py-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Videos</h2>
        {loading ? (
          <div className="video-grid">
            {[1,2,3,4].map(i => <VideoSkeleton key={i} />)}
          </div>
        ) : videos.length > 0 ? (
          <div className="video-grid">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📹</div>
            <h3 className="empty-title">No videos yet</h3>
            <p className="empty-desc">This user hasn&apos;t uploaded any videos</p>
          </div>
        )}
      </div>
    </main>
  );
}
