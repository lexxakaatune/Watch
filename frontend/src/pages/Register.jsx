import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, setAlert } from '../redux/store'

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [validationError, setValidationError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError('')
    if (form.password !== form.confirmPassword) {
      setValidationError('Passwords do not match')
      return
    }
    if (form.password.length < 6) {
      setValidationError('Password must be at least 6 characters')
      return
    }
    const result = await dispatch(registerUser({
      username: form.username,
      email: form.email,
      password: form.password
    }))
    if (registerUser.fulfilled.match(result)) {
      dispatch(setAlert({ type: 'success', message: 'Account created successfully!' }))
      navigate('/')
    } else {
      dispatch(setAlert({ type: 'error', message: result.payload || 'Registration failed' }))
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <h1>WATCH</h1>
          <p>Create your account</p>
        </div>
        <div className="auth-card">
          <form onSubmit={handleSubmit}>
            <h2 className="auth-title">Sign Up</h2>
            {(error || validationError) && <div className="alert alert-error mb-4">{validationError || error}</div>}
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="johndoe"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                minLength={3}
                maxLength={30}
              />
            </div>
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
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> : 'Create Account'}
            </button>
          </form>
          <p className="auth-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
