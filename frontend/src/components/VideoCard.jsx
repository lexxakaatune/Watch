import { Link } from 'react-router-dom'

export default function VideoCard({ video }) {
  const formatViews = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Link to={`/watch/${video._id}`} className="video-card">
      <div className="video-thumbnail">
        <img src={video.thumbnail || '/default-thumb.jpg'} alt={video.title} loading="lazy" />
        {video.duration > 0 && (
          <span className="video-duration">{formatDuration(video.duration)}</span>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <div className="video-creator">
          <img 
            src={video.creator?.avatar || '/default-avatar.png'} 
            alt={video.creator?.username} 
            className="creator-avatar"
          />
          <span className="creator-name">{video.creator?.username || 'Unknown'}</span>
        </div>
        <div className="video-meta">
          <span>{formatViews(video.views)} views</span>
          <span>&bull;</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  )
}
