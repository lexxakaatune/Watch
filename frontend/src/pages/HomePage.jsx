import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeed, fetchTrending } from '../store/slices/videoSlice';
import { useAuth } from '../hooks/useAuth';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton, ShortSkeleton } from '../components/Skeletons';
import { FlameIcon, SparklesIcon, PlayIcon, TrendingUpIcon, ClockIcon } from '../components/Icons';
import { videoAPI } from '../api/video';

const categories = ['All', 'Gaming', 'Music', 'Sports', 'News', 'Tech', 'Entertainment', 'Education', 'Lifestyle'];

export default function HomePage() {
  const dispatch = useDispatch();
  const { feed, trending, loading } = useSelector((state) => state.video);
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [shorts, setShorts] = useState([]);
  const [continueWatching, setContinueWatching] = useState([]);

  useEffect(() => {
    dispatch(fetchFeed({ category: activeCategory !== 'All' ? activeCategory : undefined }));
    dispatch(fetchTrending());

    videoAPI.getFeed({ isShort: true, limit: 5 }).then(res => {
      setShorts(res.data.data?.videos || []);
    }).catch(() => setShorts([]));

    if (isAuthenticated) {
      setContinueWatching([]);
    }
  }, [dispatch, activeCategory, isAuthenticated]);

  const heroVideo = trending[0];

  return (
    <main className="home-page">
      {heroVideo && (
        <section className="hero-section">
          <div className="hero-bg" style={{ backgroundImage: `url(${heroVideo.thumbnail})` }}></div>
          <div className="hero-overlay"></div>
          <div className="hero-content container">
            <h1 className="hero-title">{heroVideo.title}</h1>
            <div className="hero-meta">
              <span>{heroVideo.creator?.username}</span>
              <span>•</span>
              <span>{heroVideo.views?.toLocaleString()} views</span>
            </div>
            <div className="hero-actions">
              <Link to={`/watch/${heroVideo._id}`} className="hero-btn hero-btn-primary">
                <PlayIcon size={18} /> Watch Now
              </Link>
              <button className="hero-btn hero-btn-secondary">+ Watch Later</button>
            </div>
          </div>
        </section>
      )}

      <div className="container">
        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container py-6">
        {continueWatching.length > 0 && (
          <section className="mb-8">
            <div className="section-header">
              <h2 className="section-title"><ClockIcon size={20} className="section-icon" /> Continue Watching</h2>
            </div>
            <div className="video-grid">
              {continueWatching.map(video => (
                <VideoCard key={video._id} video={video} showProgress progress={video.progress} />
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="section-header">
            <h2 className="section-title"><FlameIcon size={20} className="section-icon" /> Trending Now</h2>
            <Link to="/search?sort=trending" className="section-link">See all</Link>
          </div>
          {loading ? (
            <div className="video-grid">
              {[1,2,3,4].map(i => <VideoSkeleton key={i} />)}
            </div>
          ) : (
            <div className="video-grid">
              {trending.slice(0, 4).map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
        </section>

        {shorts.length > 0 && (
          <section className="mb-8">
            <div className="section-header">
              <h2 className="section-title"><SparklesIcon size={20} className="section-icon" /> Shorts</h2>
              <Link to="/search?type=shorts" className="section-link">See all</Link>
            </div>
            <div className="shorts-grid">
              {shorts.map(short => (
                <Link key={short._id} to={`/watch/${short._id}`} className="short-card">
                  <img src={short.thumbnail} alt={short.title} loading="lazy" />
                  <div className="short-overlay">
                    <p className="short-title line-clamp-2">{short.title}</p>
                    <p className="short-views">{short.views?.toLocaleString()} views</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-8">
          <div className="section-header">
            <h2 className="section-title"><TrendingUpIcon size={20} className="section-icon" /> Recommended For You</h2>
          </div>
          {loading ? (
            <div className="video-grid">
              {[1,2,3,4,5,6,7,8].map(i => <VideoSkeleton key={i} />)}
            </div>
          ) : (
            <div className="video-grid">
              {feed.map(video => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          )}
          {feed.length === 0 && !loading && (
            <div className="empty-state">
              <div className="empty-icon">📺</div>
              <h3 className="empty-title">No videos yet</h3>
              <p className="empty-desc">Be the first to upload content!</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
