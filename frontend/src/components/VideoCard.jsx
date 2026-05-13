import { Link } from 'react-router-dom';
import { formatNumber, formatDuration, formatTimeAgo } from '../utils/constants';

export default function VideoCard({ video, showProgress = false, progress = 0 }) {
  return (
    <Link to={`/watch/${video._id}`} className="video-card">
      <div className="video-thumbnail">
        <img
          src={video.thumbnail || '/placeholder-video.jpg'}
          alt={video.title}
          loading="lazy"
        />
        <span className="video-duration">{formatDuration(video.duration)}</span>
        {video.isPremium && <span className="video-premium-badge">Premium</span>}
        {showProgress && progress > 0 && (
          <div className="video-progress-bar">
            <div className="video-progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
      <div className="video-info">
        <img
          src={video.creator?.avatar || '/default-avatar.png'}
          alt={video.creator?.username}
          className="video-avatar"
        />
        <div className="video-details">
          <h3 className="video-title line-clamp-2">{video.title}</h3>
          <div className="video-meta">
            <span className="truncate">{video.creator?.username || 'Unknown'}</span>
            <span className="video-meta-dot"></span>
            <span>{formatNumber(video.views)} views</span>
            <span className="video-meta-dot"></span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
