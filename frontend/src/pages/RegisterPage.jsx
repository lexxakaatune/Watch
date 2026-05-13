import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/slices/authSlice';
import { LogoIcon } from '../components/Icons';
import Alert from '../components/Alert';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }
    dispatch(register({ username: form.username, email: form.email, password: form.password }));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <LogoIcon size={40} />
          <span className="auth-logo-text">Watch</span>
        </div>
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the community today</p>
        {(error || validationError) && (
          <Alert type="error" message={error || validationError} onClose={() => { dispatch(clearError()); setValidationError(''); }} />
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="johndoe"
              className="form-input"
              required
              minLength={3}
              maxLength={30}
            />
          </div>
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
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="••••••••"
              className="form-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
