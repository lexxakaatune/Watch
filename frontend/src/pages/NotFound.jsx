import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4" style={{ color: 'var(--primary)' }}>404</h1>
        <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  )
}
