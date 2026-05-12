import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../redux/store'
import VideoCard from '../components/VideoCard'

export default function Home() {
  const [videos, setVideos] = useState([])
  const [trending, setTrending] = useState([])
  const [shorts, setShorts] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, user } = useSelector(state => state.auth)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feedRes, trendRes] = await Promise.all([
          api.get('/videos/feed?limit=20'),
          api.get('/videos/trending')
        ])
        setVideos(feedRes.data.data.videos || [])
        setTrending(trendRes.data.data.videos || [])
        setShorts(feedRes.data.data.videos?.filter(v => v.isShort)?.slice(0, 10) || [])
      } catch (err) {
        console.error('Failed to load feed')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="home-page min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      {trending[0] && (
        <section className="hero-section">
          <img src={trending[0].thumbnail} alt="Featured" className="hero-image" />
          <div className="hero-overlay">
            <div className="hero-content">
              <h1 className="hero-title">{trending[0].title}</h1>
              <div className="hero-meta">
                <span>{trending[0].creator?.username}</span>
                <span>&bull;</span>
                <span>{trending[0].views.toLocaleString()} views</span>
              </div>
              <div className="hero-actions">
                <Link to={`/watch/${trending[0]._id}`} className="btn btn-primary btn-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                  Watch Now
                </Link>
                <button className="btn btn-secondary btn-lg">+ Watch Later</button>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="container py-6">
        {/* Continue Watching */}
        {isAuthenticated && user?.watchHistory?.length > 0 && (
          <section className="mb-8">
            <div className="section-header">
              <h2 className="section-title">Continue Watching</h2>
              <Link to="/dashboard" className="section-link">View All</Link>
            </div>
            <div className="video-grid">
              {user.watchHistory.slice(0, 4).map(item => (
                <VideoCard key={item.video?._id || item._id} video={item.video} />
              ))}
            </div>
          </section>
        )}

        {/* Trending */}
        <section className="mb-8">
          <div className="section-header">
            <h2 className="section-title">Trending Now</h2>
            <Link to="/search" className="section-link">Explore</Link>
          </div>
          <div className="video-grid">
            {trending.slice(0, 8).map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        </section>

        {/* Shorts */}
        {shorts.length > 0 && (
          <section className="mb-8">
            <div className="section-header">
              <h2 className="section-title">Shorts</h2>
              <Link to="/search" className="section-link">View All</Link>
            </div>
            <div className="shorts-section">
              {shorts.map(video => (
                <Link key={video._id} to={`/watch/${video._id}`} className="short-card">
                  <div className="short-thumbnail">
                    <img src={video.thumbnail} alt={video.title} loading="lazy" />
                  </div>
                  <div className="p-2">
                    <h4 className="text-sm font-semibold truncate">{video.title}</h4>
                    <p className="text-xs text-[var(--text-muted)]">{video.views.toLocaleString()} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recommended */}
        <section className="mb-8">
          <div className="section-header">
            <h2 className="section-title">Recommended For You</h2>
          </div>
          <div className="video-grid">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
