import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { api, setAlert } from '../redux/store'
import VideoCard from '../components/VideoCard'

export default function Watch() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector(state => state.auth)
  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [inWatchLater, setInWatchLater] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${id}`)
        setVideo(res.data.data.video)
        setRelated(res.data.data.related || [])
        setLiked(res.data.data.video.likes?.includes(user?.id))
        setDisliked(res.data.data.video.dislikes?.includes(user?.id))
        setSubscribed(user?.subscriptions?.some(s => s.channel?.toString() === res.data.data.video.creator?._id))
        setInWatchLater(user?.watchLater?.includes(id))

        const commentsRes = await api.get(`/comments/${id}`)
        setComments(commentsRes.data.data.comments || [])

        if (isAuthenticated && videoRef.current) {
          await api.post('/users/history', { videoId: id, progress: 0 })
        }
      } catch (err) {
        dispatch(setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to load video' }))
      } finally {
        setLoading(false)
      }
    }
    fetchVideo()
    window.scrollTo(0, 0)
  }, [id, isAuthenticated, user, dispatch])

  const handleLike = async () => {
    if (!isAuthenticated) return navigate('/login')
    try {
      await api.post(`/videos/${id}/like`)
      setLiked(!liked)
      if (disliked) setDisliked(false)
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to like video' }))
    }
  }

  const handleDislike = async () => {
    if (!isAuthenticated) return navigate('/login')
    try {
      await api.post(`/videos/${id}/dislike`)
      setDisliked(!disliked)
      if (liked) setLiked(false)
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to dislike video' }))
    }
  }

  const handleSubscribe = async () => {
    if (!isAuthenticated) return navigate('/login')
    try {
      await api.post('/users/subscribe', { channelId: video.creator._id })
      setSubscribed(!subscribed)
      dispatch(setAlert({ type: 'success', message: subscribed ? 'Unsubscribed' : 'Subscribed!' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to subscribe' }))
    }
  }

  const handleWatchLater = async () => {
    if (!isAuthenticated) return navigate('/login')
    try {
      await api.post('/users/watch-later', { videoId: id })
      setInWatchLater(!inWatchLater)
      dispatch(setAlert({ type: 'success', message: inWatchLater ? 'Removed from Watch Later' : 'Added to Watch Later' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to update Watch Later' }))
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    try {
      const res = await api.post(`/comments/${id}`, { text: commentText, parentCommentId: replyTo })
      setComments([res.data.data.comment, ...comments])
      setCommentText('')
      setReplyTo(null)
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to post comment' }))
    }
  }

  const handleReport = async () => {
    if (!isAuthenticated) return navigate('/login')
    const reason = prompt('Why are you reporting this video?')
    if (!reason) return
    try {
      await api.post(`/videos/${id}/report`, { reason })
      dispatch(setAlert({ type: 'success', message: 'Report submitted' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to report' }))
    }
  }

  if (loading) {
    return (
      <div className="watch-page min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  if (!video) {
    return (
      <div className="watch-page min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Video not found</h2>
          <Link to="/" className="btn btn-primary">Go Home</Link>
        </div>
      </div>
    )
  }

  const formatViews = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="watch-page">
      <div className="watch-layout">
        <div>
          <div className="player-container">
            <video
              ref={videoRef}
              src={video.hlsUrl || video.videoUrl}
              controls
              poster={video.thumbnail}
              className="w-full h-full"
              playsInline
            />
          </div>

          <div className="watch-info">
            <h1 className="watch-title">{video.title}</h1>
            <div className="watch-actions">
              <div className="watch-stats">
                <span>{formatViews(video.views)} views</span>
                <span>&bull;</span>
                <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="action-buttons">
                <button onClick={handleLike} className={`action-btn ${liked ? 'active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M7 10v12H3V10h4zm11 12h-4v-8.5a1.5 1.5 0 0 0-3 0V22H7V10l5.5-5.5a3 3 0 0 1 4.24 0L22 10v12z"/></svg>
                  {video.likes?.length || 0}
                </button>
                <button onClick={handleDislike} className={`action-btn ${disliked ? 'active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={disliked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M17 14V2h4v12h-4zM6 2h4v8.5a1.5 1.5 0 0 0 3 0V2h4v12l-5.5 5.5a3 3 0 0 1-4.24 0L2 14V2z"/></svg>
                  {video.dislikes?.length || 0}
                </button>
                <button onClick={handleWatchLater} className={`action-btn ${inWatchLater ? 'active' : ''}`}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={inWatchLater ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2"><path d="M5 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-7-3.5L5 21V5z"/></svg>
                  Save
                </button>
                <button onClick={handleReport} className="action-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  Report
                </button>
              </div>
            </div>

            <div className="creator-bar">
              <div className="creator-info">
                <img src={video.creator?.avatar || '/default-avatar.png'} alt={video.creator?.username} className="creator-avatar-lg" />
                <div className="creator-details">
                  <h4>{video.creator?.username}</h4>
                  <p>{video.creator?.totalSubscribers?.toLocaleString() || 0} subscribers</p>
                </div>
              </div>
              {isAuthenticated && user?.id !== video.creator?._id && (
                <button onClick={handleSubscribe} className={`btn ${subscribed ? 'btn-secondary' : 'btn-primary'}`}>
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>

            <div className="description-box">
              <p className="description-text">{video.description || 'No description'}</p>
              {video.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {video.tags.map(tag => (
                    <span key={tag} className="badge badge-green">#{tag}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="comments-section">
            <div className="comments-header">
              <span className="comment-count">{comments.length} Comments</span>
              <select className="comment-sort">
                <option value="newest">Newest first</option>
                <option value="top">Top comments</option>
              </select>
            </div>
            {isAuthenticated && (
              <form onSubmit={handleComment} className="comment-form">
                <img src={user?.avatar || '/default-avatar.png'} alt="You" className="comment-avatar" />
                <div className="comment-input-wrapper">
                  <textarea
                    className="comment-input"
                    placeholder={replyTo ? 'Write a reply...' : 'Add a comment...'}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    {replyTo && (
                      <button type="button" className="btn btn-sm btn-ghost" onClick={() => setReplyTo(null)}>Cancel</button>
                    )}
                    <button type="submit" className="btn btn-sm btn-primary" disabled={!commentText.trim()}>
                      {replyTo ? 'Reply' : 'Comment'}
                    </button>
                  </div>
                </div>
              </form>
            )}
            <div>
              {comments.map(comment => (
                <div key={comment._id} className="comment-item">
                  <img src={comment.user?.avatar || '/default-avatar.png'} alt={comment.user?.username} className="comment-avatar" />
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user?.username}</span>
                      <span className="comment-time">{new Date(comment.createdAt).toLocaleDateString()}</span>
                      {comment.isPinned && <span className="badge badge-green">Pinned</span>}
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <div className="comment-actions">
                      <span className="comment-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 10v12H3V10h4zm11 12h-4v-8.5a1.5 1.5 0 0 0-3 0V22H7V10l5.5-5.5a3 3 0 0 1 4.24 0L22 10v12z"/></svg>
                        {comment.likes?.length || 0}
                      </span>
                      <span className="comment-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 14V2h4v12h-4zM6 2h4v8.5a1.5 1.5 0 0 0 3 0V2h4v12l-5.5 5.5a3 3 0 0 1-4.24 0L2 14V2z"/></svg>
                        {comment.dislikes?.length || 0}
                      </span>
                      <button className="comment-action" onClick={() => setReplyTo(comment._id)}>Reply</button>
                    </div>
                    {comment.replies?.length > 0 && (
                      <div className="replies-container">
                        {comment.replies.map(reply => (
                          <div key={reply._id} className="comment-item" style={{ marginBottom: '12px' }}>
                            <img src={reply.user?.avatar || '/default-avatar.png'} alt={reply.user?.username} className="comment-avatar" style={{ width: '32px', height: '32px' }} />
                            <div className="comment-body">
                              <div className="comment-header">
                                <span className="comment-author">{reply.user?.username}</span>
                                <span className="comment-time">{new Date(reply.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p className="comment-text">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="recommendations-sidebar">
          <h3 className="text-sm font-semibold mb-2 px-1">Up next</h3>
          {related.map(v => (
            <Link key={v._id} to={`/watch/${v._id}`} className="rec-card">
              <div className="rec-thumbnail">
                <img src={v.thumbnail} alt={v.title} loading="lazy" />
              </div>
              <div className="rec-info">
                <h4 className="rec-title">{v.title}</h4>
                <p className="rec-meta">{v.creator?.username}</p>
                <p className="rec-meta">{formatViews(v.views)} views</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
