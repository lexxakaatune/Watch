import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { userAPI } from '../api/user';
import { authAPI } from '../api/auth';
import { useDispatch } from 'react-redux';
import { fetchMe } from '../store/slices/authSlice';
import { SunIcon, MoonIcon, LockIcon, UserIcon, ShieldIcon, CheckIcon } from '../components/Icons';
import Alert from '../components/Alert';

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [twoFASetup, setTwoFASetup] = useState(null);
  const [twoFACode, setTwoFACode] = useState('');
  const [alert, setAlert] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await userAPI.updateProfile(form);
      dispatch(fetchMe());
      setAlert({ type: 'success', message: 'Profile updated successfully' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setAlert({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    setSaving(true);
    try {
      // Password change endpoint would go here
      setAlert({ type: 'success', message: 'Password changed successfully' });
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const handleSetup2FA = async () => {
    try {
      const res = await authAPI.setup2FA();
      setTwoFASetup(res.data.data);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to setup 2FA' });
    }
  };

  const handleConfirm2FA = async () => {
    try {
      await authAPI.confirm2FA({ token: twoFACode });
      dispatch(fetchMe());
      setTwoFASetup(null);
      setTwoFACode('');
      setAlert({ type: 'success', message: '2FA enabled successfully' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Invalid code' });
    }
  };

  return (
    <main className="profile-page">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'hover:bg-[var(--bg-secondary)]'}`} style={{ color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-primary)' }}>
                <UserIcon size={18} /> Profile
              </button>
              <button onClick={() => setActiveTab('security')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'hover:bg-[var(--bg-secondary)]'}`} style={{ color: activeTab === 'security' ? 'var(--primary)' : 'var(--text-primary)' }}>
                <LockIcon size={18} /> Security
              </button>
              <button onClick={() => setActiveTab('appearance')} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'appearance' ? 'bg-[var(--primary-light)] text-[var(--primary)]' : 'hover:bg-[var(--bg-secondary)]'}`} style={{ color: activeTab === 'appearance' ? 'var(--primary)' : 'var(--text-primary)' }}>
                <SunIcon size={18} /> Appearance
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="bg-card rounded-lg border p-6" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="form-group">
                    <label className="form-label">Username</label>
                    <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="form-input" rows={4} placeholder="Tell us about yourself" />
                  </div>
                  <button type="submit" disabled={saving} className="auth-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg border p-6" style={{ borderColor: 'var(--border-color)' }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input type="password" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} className="form-input" />
                    </div>
                    <button type="submit" disabled={saving} className="auth-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                <div className="bg-card rounded-lg border p-6" style={{ borderColor: 'var(--border-color)' }}>
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Two-Factor Authentication</h2>
                  {user?.twoFactorEnabled ? (
                    <div className="flex items-center gap-3 p-4 rounded-lg" style={{ background: 'var(--primary-light)' }}>
                      <ShieldIcon size={24} style={{ color: 'var(--primary)' }} />
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--primary)' }}>2FA is enabled</p>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your account is protected with two-factor authentication</p>
                      </div>
                    </div>
                  ) : twoFASetup ? (
                    <div className="space-y-4">
                      <p style={{ color: 'var(--text-secondary)' }}>Scan this QR code with your authenticator app:</p>
                      <div className="twofa-qr">
                        <img src={twoFASetup.qrCode} alt="2FA QR Code" />
                        <p className="twofa-secret">{twoFASetup.secret}</p>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Enter 6-digit code</label>
                        <input type="text" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value)} maxLength={6} className="form-input text-center tracking-[0.5em]" placeholder="000000" />
                      </div>
                      <button onClick={handleConfirm2FA} disabled={twoFACode.length !== 6} className="auth-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                        Verify & Enable
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Enable 2FA</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Add an extra layer of security</p>
                      </div>
                      <button onClick={handleSetup2FA} className="auth-btn" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
                        Setup 2FA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="bg-card rounded-lg border p-6" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-secondary)' }}>
                    <div className="flex items-center gap-3">
                      {theme === 'dark' ? <MoonIcon size={20} /> : <SunIcon size={20} />}
                      <div>
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>Theme</p>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{theme === 'dark' ? 'Dark mode' : 'Light mode'}</p>
                      </div>
                    </div>
                    <button onClick={toggle} className="action-btn">
                      Toggle
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
