import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoAPI } from '../api/video';
import VideoCard from '../components/VideoCard';
import { VideoSkeleton } from '../components/Skeletons';
import { SearchIcon, FilterIcon } from '../components/Icons';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('relevance');

  useEffect(() => {
    const performSearch = async () => {
      if (!query) { setLoading(false); return; }
      setLoading(true);
      try {
        const res = await videoAPI.getFeed({ search: query, sort: filter });
        setResults(res.data.data?.videos || []);
      } catch (err) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query, filter]);

  return (
    <main className="home-page">
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          <div className="flex items-center gap-2">
            <FilterIcon size={18} style={{ color: 'var(--text-muted)' }} />
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-input text-sm py-1.5" style={{ width: 140 }}>
              <option value="relevance">Relevance</option>
              <option value="date">Upload Date</option>
              <option value="views">View Count</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="video-grid">
            {[1,2,3,4,5,6].map(i => <VideoSkeleton key={i} />)}
          </div>
        ) : results.length > 0 ? (
          <div className="video-grid">
            {results.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3 className="empty-title">No results found</h3>
            <p className="empty-desc">Try different keywords or check your spelling</p>
          </div>
        )}
      </div>
    </main>
  );
}
