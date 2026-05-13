import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { creatorAPI } from '../api/creator';
import { useAuth } from '../hooks/useAuth';
import {
  DashboardIcon, AnalyticsIcon, DollarIcon, FilmIcon,
  TrendingUpIcon, EyeIcon, HeartIcon, UsersIcon
} from '../components/Icons';
import { formatNumber } from '../utils/constants';
import Alert from '../components/Alert';

export default function CreatorDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [aRes, eRes] = await Promise.all([
          creatorAPI.getAnalytics(),
          creatorAPI.getEarnings(),
        ]);
        setAnalytics(aRes.data.data);
        setEarnings(eRes.data.data);
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to load creator data' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const stats = [
    { label: 'Total Views', value: formatNumber(analytics?.totalViews || 0), icon: EyeIcon, color: 'blue' },
    { label: 'Subscribers', value: formatNumber(user?.totalSubscribers || 0), icon: UsersIcon, color: 'green' },
    { label: 'Total Likes', value: formatNumber(analytics?.totalLikes || 0), icon: HeartIcon, color: 'red' },
    { label: 'Earnings', value: `$${(earnings?.total || 0).toFixed(2)}`, icon: DollarIcon, color: 'amber' },
  ];

  return (
    <main className="dashboard-page">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="dashboard-layout">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <p className="dashboard-sidebar-title">Creator Studio</p>
          <nav className="dashboard-nav">
            <button onClick={() => setActiveTab('overview')} className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <DashboardIcon size={18} /> Overview
            </button>
            <button onClick={() => setActiveTab('analytics')} className={`dashboard-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
              <AnalyticsIcon size={18} /> Analytics
            </button>
            <button onClick={() => setActiveTab('earnings')} className={`dashboard-nav-item ${activeTab === 'earnings' ? 'active' : ''}`}>
              <DollarIcon size={18} /> Earnings
            </button>
            <button onClick={() => setActiveTab('videos')} className={`dashboard-nav-item ${activeTab === 'videos' ? 'active' : ''}`}>
              <FilmIcon size={18} /> Videos
            </button>
          </nav>
        </aside>

        {/* Main */}
        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-header-title">Creator Dashboard</h1>
            <p className="dashboard-header-subtitle">Manage your content and track performance</p>
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="stats-grid">
                {stats.map((stat, i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-card-header">
                      <span className="stat-card-label">{stat.label}</span>
                      <div className={`stat-card-icon ${stat.color}`}><stat.icon size={20} /></div>
                    </div>
                    <div className="stat-card-value">{stat.value}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="data-table-container">
                  <div className="data-table-header">
                    <h3 className="data-table-title">Recent Videos</h3>
                  </div>
                  {loading ? (
                    <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
                  ) : (
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Video</th>
                          <th>Views</th>
                          <th>Likes</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos.slice(0, 5).map(video => (
                          <tr key={video._id}>
                            <td>
                              <div className="table-user">
                                <img src={video.thumbnail} alt="" className="table-user-avatar" style={{ width: 60, height: 36, borderRadius: 4 }} />
                                <span className="table-user-name truncate">{video.title}</span>
                              </div>
                            </td>
                            <td>{formatNumber(video.views)}</td>
                            <td>{formatNumber(video.likes?.length || 0)}</td>
                            <td><span className={`badge badge-${video.status === 'ready' ? 'success' : video.status === 'processing' ? 'warning' : 'info'}`}>{video.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="data-table-container">
                  <div className="data-table-header">
                    <h3 className="data-table-title">Earnings Overview</h3>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span style={{ color: 'var(--text-secondary)' }}>This Month</span>
                      <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>${(earnings?.monthly || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <span style={{ color: 'var(--text-secondary)' }}>Total Earnings</span>
                      <span className="font-bold text-lg">${(earnings?.total || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{ color: 'var(--text-secondary)' }}>Pending Payout</span>
                      <span className="font-bold text-lg" style={{ color: 'var(--warning)' }}>${(earnings?.pending || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'analytics' && (
            <div className="data-table-container p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Channel Analytics</h3>
              <p style={{ color: 'var(--text-muted)' }}>Detailed analytics coming soon...</p>
            </div>
          )}

          {activeTab === 'earnings' && (
            <div className="data-table-container p-6">
              <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Earnings Details</h3>
              <p style={{ color: 'var(--text-muted)' }}>Detailed earnings report coming soon...</p>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="data-table-container">
              <div className="data-table-header flex items-center justify-between">
                <h3 className="data-table-title">My Videos</h3>
                <Link to="/upload" className="action-btn" style={{ background: 'var(--primary)', color: '#fff' }}>
                  + Upload New
                </Link>
              </div>
              {loading ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Views</th>
                      <th>Likes</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.map(video => (
                      <tr key={video._id}>
                        <td>
                          <div className="table-user">
                            <img src={video.thumbnail} alt="" className="table-user-avatar" style={{ width: 60, height: 36, borderRadius: 4 }} />
                            <span className="table-user-name truncate">{video.title}</span>
                          </div>
                        </td>
                        <td>{formatNumber(video.views)}</td>
                        <td>{formatNumber(video.likes?.length || 0)}</td>
                        <td><span className={`badge badge-${video.status === 'ready' ? 'success' : video.status === 'processing' ? 'warning' : 'info'}`}>{video.status}</span></td>
                        <td>
                          <div className="table-actions">
                            <button className="table-action-btn"><EditIcon size={16} /></button>
                            <button className="table-action-btn danger"><TrashIcon size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
