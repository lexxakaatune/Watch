import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { logout } from '../store/slices/authSlice';
import { toggleSidebar } from '../store/slices/uiSlice';
import {
  LogoIcon, SearchIcon, MenuIcon, SunIcon, MoonIcon,
  BellIcon, MessageIcon, UploadIcon, UserIcon, LogoutIcon,
  DashboardIcon, SettingsIcon, ChevronDownIcon, CloseIcon
} from './Icons';

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggle } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setProfileOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'superadmin': return '/superadmin';
      case 'admin': return '/admin';
      case 'moderator': return '/moderator';
      case 'creator': return '/creator';
      default: return '/dashboard';
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between" style={{  minWidth: '100%', height: 'var(--header-height)', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container h-full flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <MenuIcon size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <LogoIcon size={32} />
            <span className="font-bold text-lg hidden sm:block" style={{ color: 'var(--text-primary)' }}>Watch</span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-xl hidden md:block">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, creators..."
              className="w-full py-2.5 pl-4 pr-12 rounded-full text-sm"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-[var(--bg-tertiary)] transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <SearchIcon size={18} />
            </button>
          </form>
        </div>

        {/* Mobile Search Toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-[var(--bg-secondary)]"
          onClick={() => setSearchOpen(!searchOpen)}
        >
          <SearchIcon size={22} />
        </button>

        {/* Right */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <Link
                to="/upload"
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ color: 'var(--text-primary)' }}
              >
                <UploadIcon size={18} />
                <span className="hidden lg:inline">Upload</span>
              </Link>

              <Link
                to="/messages"
                className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors relative"
                style={{ color: 'var(--text-secondary)' }}
              >
                <MessageIcon size={20} />
              </Link>

              <Link
                to="/notifications"
                className="p-2 rounded-md hover:bg-[var(--bg-secondary)] transition-colors relative"
                style={{ color: 'var(--text-secondary)' }}
              >
                <BellIcon size={20} />
              </Link>

              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <img
                    src={user?.avatar || '/default-avatar.png'}
                    alt={user?.username}
                    className="w-8 h-8 rounded-full object-cover"
                    style={{ background: 'var(--bg-tertiary)' }}
                  />
                  <ChevronDownIcon size={16} style={{ color: 'var(--text-muted)' }} />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden shadow-lg"
                    style={{ background: 'var(--card-surface)', border: '1px solid var(--border-color)' }}>
                    <div className="p-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{user?.username}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide"
                        style={{
                          background: user?.role === 'superadmin' ? 'rgba(168,85,247,0.15)' :
                            user?.role === 'admin' ? 'rgba(59,130,246,0.15)' :
                              user?.role === 'moderator' ? 'var(--warning-light)' :
                                user?.role === 'creator' ? 'var(--primary-light)' :
                                  'var(--bg-tertiary)',
                          color: user?.role === 'superadmin' ? '#A855F7' :
                            user?.role === 'admin' ? '#3B82F6' :
                              user?.role === 'moderator' ? 'var(--warning)' :
                                user?.role === 'creator' ? 'var(--primary)' :
                                  'var(--text-muted)'
                        }}>
                        {user?.role}
                      </span>
                    </div>
                    <div className="py-1">
                      <Link to={`/profile/${user?.username}`} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}>
                        <UserIcon size={16} /> Profile
                      </Link>
                      <Link to={getDashboardLink()} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}>
                        <DashboardIcon size={16} /> Dashboard
                      </Link>
                      <Link to="/settings" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors"
                        style={{ color: 'var(--text-primary)' }}>
                        <SettingsIcon size={16} /> Settings
                      </Link>
                      <div className="border-t my-1" style={{ borderColor: 'var(--border-color)' }}></div>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-[var(--bg-secondary)] transition-colors text-left"
                        style={{ color: 'var(--error)' }}>
                        <LogoutIcon size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
                style={{ background: 'var(--primary)', color: '#fff' }}>
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {searchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 p-3" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)' }}>
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              autoFocus
              className="w-full py-2.5 pl-4 pr-12 rounded-full text-sm"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              <SearchIcon size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[var(--header-height)] z-40" style={{ background: 'var(--bg-primary)' }}>
          <div className="p-4 flex flex-col gap-1">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
              style={{ color: isActive('/') ? 'var(--primary)' : 'var(--text-primary)', background: isActive('/') ? 'var(--primary-light)' : 'transparent' }}>
              <span className="text-lg">🏠</span> Home
            </Link>
            <Link to="/search" onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}>
              <span className="text-lg">🔍</span> Search
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}>
                  <span className="text-lg">📊</span> Dashboard
                </Link>
                <Link to="/upload" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}>
                  <span className="text-lg">📤</span> Upload
                </Link>
                <Link to="/messages" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}>
                  <span className="text-lg">💬</span> Messages
                </Link>
                <Link to="/notifications" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}>
                  <span className="text-lg">🔔</span> Notifications
                </Link>
                <Link to="/settings" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}>
                  <span className="text-lg">⚙️</span> Settings
                </Link>
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-left"
                  style={{ color: 'var(--error)' }}>
                  <span className="text-lg">🚪</span> Sign Out
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium"
                  style={{ color: 'var(--primary)' }}>
                  <span className="text-lg">🔑</span> Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
