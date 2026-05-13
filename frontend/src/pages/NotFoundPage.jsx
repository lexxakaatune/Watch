import { Link } from 'react-router-dom';
import { HomeIcon } from '../components/Icons';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)', paddingTop: 'var(--header-height)' }}>
      <div className="text-center px-4">
        <div className="text-8xl mb-4">😕</div>
        <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>404</h1>
        <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>Page not found</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
          style={{ background: 'var(--primary)', color: '#fff' }}>
          <HomeIcon size={18} /> Go Home
        </Link>
      </div>
    </main>
  );
}
