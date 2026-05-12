import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../redux/store'
import VideoCard from '../components/VideoCard'

export default function SearchResults() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const search = async () => {
      if (!query) {
        setLoading(false)
        return
      }
      try {
        const res = await api.get(`/videos/feed?search=${encodeURIComponent(query)}&limit=50`)
        setVideos(res.data.data.videos || [])
      } catch (err) {
        console.error('Search failed')
      } finally {
        setLoading(false)
      }
    }
    search()
  }, [query])

  return (
    <div className="home-page">
      <div className="container py-6">
        <h1 className="text-xl font-bold mb-6">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner" />
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-12">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" className="mx-auto mb-4"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <h3 className="text-lg font-semibold text-[var(--text-secondary)]">No results found</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">Try different keywords</p>
          </div>
        ) : (
          <div className="video-grid">
            {videos.map(video => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
