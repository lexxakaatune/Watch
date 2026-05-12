import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
      <div className="container py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="14" stroke="#22C55E" strokeWidth="2.5" fill="none"/>
                <polygon points="12,10 24,16 12,22" fill="#22C55E"/>
              </svg>
              <span className="text-lg font-bold" style={{ color: 'var(--primary)' }}>WATCH</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Premium streaming platform for creators and viewers worldwide.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-sm hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Home</Link></li>
              <li><Link to="/search" className="text-sm hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Trending</Link></li>
              <li><Link to="/search" className="text-sm hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Shorts</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Support</h4>
            <ul className="space-y-2">
              <li><span className="text-sm cursor-pointer hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Help Center</span></li>
              <li><span className="text-sm cursor-pointer hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Community</span></li>
              <li><span className="text-sm cursor-pointer hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Contact</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><span className="text-sm cursor-pointer hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Terms</span></li>
              <li><span className="text-sm cursor-pointer hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Privacy</span></li>
              <li><span className="text-sm cursor-pointer hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--text-secondary)' }}>Copyright</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          &copy; {new Date().getFullYear()} Watch Platform. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
