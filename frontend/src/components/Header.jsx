import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logoutUser, toggleTheme, toggleSidebar, setSearchQuery } from '../redux/store'

export default function Header() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useSelector(state => state.auth)
  const { mode } = useSelector(state => state.theme)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = async () => {
    await dispatch(logoutUser())
    navigate('/')
    setMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchValue.trim()) {
      dispatch(setSearchQuery(searchValue))
      navigate(`/search?q=${encodeURIComponent(searchValue)}`)
      setSearchOpen(false)
      setSearchValue('')
    }
  }

  const getDashboardLink = () => {
    if (!user) return null
    switch (user.role) {
      case 'superadmin': return '/superadmin/dashboard'
      case 'admin': return '/admin/dashboard'
      case 'moderator': return '/moderator/dashboard'
      case 'creator': return '/creator/dashboard'
      default: return '/dashboard'
    }
  }

  const dashboardLink = getDashboardLink()

  return (
    <header className="fixed top-0 left-0 right-0 z-50" style={{ height: 'var(--header-height)', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
      <nav className="container h-full flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            className="md:hidden btn-ghost p-2" 
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="#22C55E" strokeWidth="2.5" fill="none"/>
              <polygon points="12,10 24,16 12,22" fill="#22C55E"/>
            </svg>
            <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>WATCH</span>
          </Link>
        </div>

        <form onSubmit={handleSearch} className={`flex-1 max-w-xl ${searchOpen ? 'flex absolute left-0 right-0 top-full p-4 bg-[var(--surface)] border-b border-[var(--border)]' : 'hidden md:flex'}`}>
          <div className="relative w-full">
            <input
              type="search"
              placeholder="Search videos, creators..."
              className="w-full px-4 py-2 pl-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] focus:border-[var(--primary)] focus:outline-none"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button 
            className="md:hidden btn-ghost p-2" 
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Search"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          </button>

          <button 
            className="btn-ghost p-2 rounded-full" 
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            {mode === 'dark' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>

          {isAuthenticated ? (
            <div className="relative">
              <button 
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[var(--surface-hover)] transition-colors"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <img 
                  src={user?.avatar || '/default-avatar.png'} 
                  alt={user?.username} 
                  className="w-8 h-8 rounded-full object-cover bg-[var(--bg-secondary)]"
                />
                <span className="hidden md:block text-sm font-medium text-[var(--text-primary)]">{user?.username}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hidden md:block text-[var(--text-muted)]"><path d="m6 9 6 6 6-6"/></svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-3 border-b border-[var(--border)]">
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{user?.username}</p>
                      <p className="text-xs text-[var(--text-muted)]">{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-[var(--primary)] text-white font-medium capitalize">{user?.role}</span>
                    </div>
                    <div className="py-1">
                      {dashboardLink && (
                        <Link to={dashboardLink} className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>
                          Dashboard
                        </Link>
                      )}
                      <Link to={`/profile/${user?.username}`} className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>
                        My Profile
                      </Link>
                      <Link to="/settings" className="block px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]" onClick={() => setMenuOpen(false)}>
                        Settings
                      </Link>
                      <hr className="my-1 border-[var(--border)]" />
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-[var(--error)] hover:bg-[var(--error-bg)]">
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-sm btn-ghost">Sign In</Link>
              <Link to="/register" className="btn btn-sm btn-primary hidden sm:inline-flex">Sign Up</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
