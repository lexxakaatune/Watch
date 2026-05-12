import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, setAlert } from '../redux/store'

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)
  const [form, setForm] = useState({ email: '', password: '' })
  const [needs2FA, setNeeds2FA] = useState(false)
  const [twoFAToken, setTwoFAToken] = useState('')
  const [userEmail, setUserEmail] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await dispatch(loginUser(form))
    if (loginUser.fulfilled.match(result)) {
      if (result.payload.requires2FA) {
        setNeeds2FA(true)
        setUserEmail(form.email)
      } else {
        dispatch(setAlert({ type: 'success', message: 'Welcome back!' }))
        navigate('/')
      }
    } else {
      dispatch(setAlert({ type: 'error', message: result.payload || 'Login failed' }))
    }
  }

  const handle2FASubmit = async (e) => {
    e.preventDefault()
    try {
      await import('../redux/store').then(({ api }) => 
        api.post('/auth/2fa/verify', { email: userEmail, token: twoFAToken })
      )
      dispatch(setAlert({ type: 'success', message: 'Welcome back!' }))
      navigate('/')
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Invalid 2FA code' }))
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>WATCH</h1>
          <p>Sign in to continue</p>
        </div>
        <div className="auth-card">
          {!needs2FA ? (
            <form onSubmit={handleSubmit}>
              <h2 className="auth-title">Sign In</h2>
              {error && <div className="alert alert-error mb-4">{error}</div>}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="two-fa-form">
              <h2 className="auth-title">Two-Factor Authentication</h2>
              <p>Enter the 6-digit code from your authenticator app</p>
              <div className="form-group">
                <input
                  type="text"
                  className="form-input"
                  placeholder="000000"
                  maxLength={6}
                  value={twoFAToken}
                  onChange={(e) => setTwoFAToken(e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full">
                Verify
              </button>
            </form>
          )}
          <p className="auth-footer">
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
