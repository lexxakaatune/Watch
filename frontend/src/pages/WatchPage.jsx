import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVideo, clearCurrentVideo } from '../store/slices/videoSlice';
import { useAuth } from '../hooks/useAuth';
import { videoAPI } from '../api/video';
import { commentAPI } from '../api/comment';
import { formatNumber, formatDuration, formatTimeAgo } from '../utils/constants';
import {
  LikeIcon, DislikeIcon, ShareIcon, SaveIcon, DownloadIcon, ReportIcon,
  PlayIcon, PauseIcon, VolumeIcon, VolumeMuteIcon, FullscreenIcon, PIPIcon,
  MoreIcon, SortIcon, SendIcon
} from '../components/Icons';
import Alert from '../components/Alert';

export default function WatchPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentVideo, loading } = useSelector((state) => state.video);
  const { user, isAuthenticated } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [alert, setAlert] = useState(null);
  const controlsTimeout = useRef(null);

  useEffect(() => {
    dispatch(fetchVideo(id));
    return () => dispatch(clearCurrentVideo());
  }, [id, dispatch]);

  useEffect(() => {
    if (videoRef.current && currentVideo?.videoKey) {
      videoRef.current.load();
    }
  }, [currentVideo]);


  useEffect(() => {
    if (currentVideo) {
      commentAPI.getComments(id).then(res => {
        setComments(res.data.data?.comments || []);
      }).catch(() => setComments([]));

      videoAPI.getFeed({ exclude: id, limit: 8 }).then(res => {
        setRecommendations(res.data.data?.videos || []);
      }).catch(() => setRecommendations([]));

      setLiked(currentVideo.likes?.includes(user?.id));
      setDisliked(currentVideo.dislikes?.includes(user?.id));
    }
  }, [currentVideo, id, user]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    if (videoRef.current) {
      videoRef.current.currentTime = pos * duration;
      setCurrentTime(pos * duration);
    }
  };

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (videoRef.current) videoRef.current.volume = vol;
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-player-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  const handleLike = async () => {
    if (!isAuthenticated) { setAlert({ type: 'error', message: 'Please sign in to like videos' }); return; }
    try {
      await videoAPI.likeVideo(id);
      setLiked(!liked);
      if (disliked) setDisliked(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to like' });
    }
  };

  const handleDislike = async () => {
    if (!isAuthenticated) { setAlert({ type: 'error', message: 'Please sign in to dislike videos' }); return; }
    try {
      await videoAPI.dislikeVideo(id);
      setDisliked(!disliked);
      if (liked) setLiked(false);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to dislike' });
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isAuthenticated) return;
    try {
      const res = await commentAPI.addComment(id, commentText.trim());
      setComments([res.data.data?.comment, ...comments]);
      setCommentText('');
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to post comment' });
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) { setAlert({ type: 'error', message: 'Please sign in to subscribe' }); return; }
    setSubscribed(!subscribed);
  };

  if (loading || !currentVideo) {
    return (
      <div className="watch-page">
        <div className="container py-8">
          <div className="skeleton" style={{ aspectRatio: '16/9', borderRadius: 12, marginBottom: 24 }}></div>
          <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 12 }}></div>
          <div className="skeleton" style={{ width: '30%', height: 16 }}></div>
        </div>
      </div>
    );
  }

  return (
    <main className="watch-page">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="watch-layout container">
        <div>
          {/* Video Player */}
          <div
            className="video-player-container"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
          >
            <video
              ref={videoRef}
              src={videoAPI.streamVideo(currentVideo.videoKey)}
              poster={currentVideo.thumbnail}
              type="video/mp4" 
              Preload="metadata"
              onClick={handlePlayPause}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              playsInline
            />
            <div className={`player-controls-overlay ${showControls ? '' : 'opacity-0'}`}>
              <div className="player-progress" onClick={handleSeek}>
                <div className="player-progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}>
                  <div className="player-progress-handle"></div>
                </div>
              </div>
              <div className="player-buttons">
                <div className="flex items-center gap-3">
                  <button onClick={handlePlayPause} className="player-btn">
                    {isPlaying ? <PauseIcon size={20} /> : <PlayIcon size={20} />}
                  </button>
                  <button onClick={toggleMute} className="player-btn">
                    {isMuted ? <VolumeMuteIcon size={18} /> : <VolumeIcon size={18} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="player-volume-slider hidden sm:block"
                  />
                  <span className="player-time hidden sm:inline">
                    {formatDuration(currentTime)} / {formatDuration(duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="player-btn hidden sm:flex"><PIPIcon size={18} /></button>
                  <button onClick={toggleFullscreen} className="player-btn">
                    <FullscreenIcon size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="video-info-section">
            <h1 className="video-info-title">{currentVideo.title}</h1>
            <div className="video-info-meta">
              <span className="video-info-views">{formatNumber(currentVideo.views)} views • {formatTimeAgo(currentVideo.createdAt)}</span>
              <div className="video-info-actions">
                <button onClick={handleLike} className={`action-btn ${liked ? 'active' : ''}`}>
                  <LikeIcon size={18} filled={liked} /> {formatNumber(currentVideo.likes?.length || 0)}
                </button>
                <button onClick={handleDislike} className={`action-btn ${disliked ? 'active' : ''}`}>
                  <DislikeIcon size={18} filled={disliked} />
                </button>
                <button className="action-btn"><ShareIcon size={18} /> Share</button>
                <button className={`action-btn ${saved ? 'active' : ''}`}><SaveIcon size={18} filled={saved} /> Save</button>
                <button className="action-btn hidden sm:inline-flex"><DownloadIcon size={18} /> Download</button>
                <button className="action-btn action-btn-danger"><ReportIcon size={18} /> Report</button>
              </div>
            </div>

            {/* Creator Bar */}
            <div className="creator-bar">
              <img src={currentVideo.creator?.avatar || '/default-avatar.png'} alt="" className="creator-bar-avatar" />
              <div className="creator-bar-info">
                <p className="creator-bar-name">{currentVideo.creator?.username}</p>
                <p className="creator-bar-subs">{formatNumber(currentVideo.creator?.totalSubscribers || 0)} subscribers</p>
              </div>
              <button onClick={handleSubscribe} className={`subscribe-btn ${subscribed ? 'subscribed' : ''}`}>
                {subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Description */}
            <div className="video-description">
              <p className="video-description-text">{currentVideo.description || 'No description provided.'}</p>
              {currentVideo.tags?.length > 0 && (
                <div className="video-description-tags">
                  {currentVideo.tags.map(tag => (
                    <span key={tag} className="video-tag">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="comments-section">
              <h3 className="comments-header">{comments.length} Comments</h3>
              {isAuthenticated && (
                <form onSubmit={handleComment} className="comment-form">
                  <img src={user?.avatar || '/default-avatar.png'} alt="" className="comment-avatar" />
                  <div className="comment-input-wrapper">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="comment-input"
                      rows={1}
                    />
                    <div className="comment-actions">
                      <button type="button" onClick={() => setCommentText('')} className="comment-btn comment-btn-cancel">Cancel</button>
                      <button type="submit" disabled={!commentText.trim()} className="comment-btn comment-btn-submit">Comment</button>
                    </div>
                  </div>
                </form>
              )}
              <div>
                {comments.map(comment => (
                  <div key={comment._id} className="comment-item">
                    <img src={comment.user?.avatar || '/default-avatar.png'} alt="" className="comment-avatar" />
                    <div className="comment-body">
                      <div className="comment-header">
                        <span className="comment-author">{comment.user?.username}</span>
                        <span className="comment-time">{formatTimeAgo(comment.createdAt)}</span>
                        {comment.isPinned && <span className="comment-pinned">📌 Pinned</span>}
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions-bar">
                        <button className="comment-action"><LikeIcon size={14} /> {formatNumber(comment.likes?.length || 0)}</button>
                        <button className="comment-action"><DislikeIcon size={14} /></button>
                        <button className="comment-action">Reply</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Recommendations */}
        <aside className="watch-sidebar">
          <h3 className="sidebar-title">Up Next</h3>
          {recommendations.map(video => (
            <Link key={video._id} to={`/watch/${video._id}`} className="recommendation-card">
              <div className="recommendation-thumb relative">
                <img src={video.thumbnail} alt={video.title} loading="lazy" />
                <span className="recommendation-duration">{formatDuration(video.duration)}</span>
              </div>
              <div className="recommendation-info">
                <h4 className="recommendation-title line-clamp-2">{video.title}</h4>
                <p className="recommendation-meta">{video.creator?.username} • {formatNumber(video.views)} views</p>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </main>
  );
}
