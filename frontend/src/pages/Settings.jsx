import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { api, setAlert } from '../redux/store'

export default function Settings() {
  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)
  const [activeSection, setActiveSection] = useState('account')
  const [username, setUsername] = useState(user?.username || '')
  const [twoFASetup, setTwoFASetup] = useState(null)
  const [twoFACode, setTwoFACode] = useState('')

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    try {
      await api.put('/users/profile', { username })
      dispatch(setAlert({ type: 'success', message: 'Profile updated' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: err.response?.data?.error || 'Update failed' }))
    }
  }

  const handleSetup2FA = async () => {
    try {
      const res = await api.post('/auth/2fa/setup')
      setTwoFASetup(res.data.data)
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to setup 2FA' }))
    }
  }

  const handleConfirm2FA = async () => {
    try {
      await api.post('/auth/2fa/confirm', { token: twoFACode })
      setTwoFASetup(null)
      dispatch(setAlert({ type: 'success', message: '2FA enabled successfully' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Invalid code' }))
    }
  }

  return (
    <div className="profile-page">
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="dashboard-layout" style={{ gridTemplateColumns: '200px 1fr', minHeight: 'auto' }}>
          <div className="dashboard-sidebar" style={{ position: 'static', width: 'auto', padding: '16px 0' }}>
            <button className={`sidebar-link w-full ${activeSection === 'account' ? 'active' : ''}`} onClick={() => setActiveSection('account')}>
              Account
            </button>
            <button className={`sidebar-link w-full ${activeSection === 'security' ? 'active' : ''}`} onClick={() => setActiveSection('security')}>
              Security
            </button>
            <button className={`sidebar-link w-full ${activeSection === 'notifications' ? 'active' : ''}`} onClick={() => setActiveSection('notifications')}>
              Notifications
            </button>
          </div>
          <div className="dashboard-main">
            {activeSection === 'account' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>Profile Information</h3>
                  <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-input" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-input" value={user?.email || ''} disabled />
                    </div>
                    <button type="submit" className="btn btn-primary">Save Changes</button>
                  </form>
                </div>
              </div>
            )}
            {activeSection === 'security' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>Two-Factor Authentication</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Authenticator App</div>
                      <div className="settings-desc">Secure your account with 2FA</div>
                    </div>
                    {user?.twoFactorEnabled ? (
                      <span className="badge badge-green">Enabled</span>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={handleSetup2FA}>Enable</button>
                    )}
                  </div>
                  {twoFASetup && (
                    <div className="mt-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
                      <p className="text-sm mb-2">Scan this QR code with your authenticator app:</p>
                      <div className="qr-code">
                        <img src={twoFASetup.qrCode} alt="2FA QR Code" />
                      </div>
                      <p className="text-sm mt-2">Or enter this secret key manually:</p>
                      <div className="secret-key">{twoFASetup.secret}</div>
                      <div className="form-group mt-4">
                        <label className="form-label">Enter 6-digit code to confirm</label>
                        <input type="text" className="form-input" maxLength={6} value={twoFACode} onChange={(e) => setTwoFACode(e.target.value.replace(/\D/g, ''))} placeholder="000000" />
                      </div>
                      <button className="btn btn-primary mt-2" onClick={handleConfirm2FA}>Confirm 2FA</button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <div className="settings-card">
                  <h3>Notification Preferences</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Email Notifications</div>
                      <div className="settings-desc">Receive updates via email</div>
                    </div>
                    <div className="toggle active"><div className="toggle-knob" /></div>
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label">Push Notifications</div>
                      <div className="settings-desc">Browser push notifications</div>
                    </div>
                    <div className="toggle active"><div className="toggle-knob" /></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
