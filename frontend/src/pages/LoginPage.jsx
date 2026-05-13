import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { login, clearError } from '../store/slices/authSlice';
import { LogoIcon } from '../components/Icons';
import Alert from '../components/Alert';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, requires2FA, pending2FAEmail } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [twoFACode, setTwoFACode] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form));
  };

  const handle2FASubmit = (e) => {
    e.preventDefault();
    dispatch(verify2FA({ email: pending2FAEmail, token: twoFACode }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <LogoIcon size={40} />
          <span className="auth-logo-text">Watch</span>
        </div>

        {requires2FA ? (
          <>
            <h1 className="auth-title">Two-Factor Authentication</h1>
            <p className="auth-subtitle">Enter the 6-digit code from your authenticator app</p>
            {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}
            <form onSubmit={handle2FASubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">2FA Code</label>
                <input
                  type="text"
                  value={twoFACode}
                  onChange={(e) => setTwoFACode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  className="form-input text-center text-lg tracking-[0.5em]"
                  required
                />
              </div>
              <button type="submit" disabled={loading || twoFACode.length !== 6} className="auth-btn">
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue watching</p>
            {error && <Alert type="error" message={error} onClose={() => dispatch(clearError())} />}
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="form-input"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <p className="auth-footer">
              Don&apos;t have an account? <Link to="/register" className="auth-link">Get Started</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
