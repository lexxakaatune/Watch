import { useState, useEffect } from 'react';
import { moderatorAPI } from '../api/moderator';
import { adminAPI } from '../api/admin';
import {
  DashboardIcon, FlagIcon, FilmIcon, MessageSquareIcon, UsersIcon,
  CheckIcon, XIcon, EyeIcon, BanIcon
} from '../components/Icons';
import { formatTimeAgo } from '../utils/constants';
import Alert from '../components/Alert';

export default function ModeratorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingUploads, setPendingUploads] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [uRes, rRes] = await Promise.all([
          moderatorAPI.getPendingUploads(),
          adminAPI.getReports(),
        ]);
        setPendingUploads(uRes.data.data?.uploads || []);
        setReports(rRes.data.data?.reports || []);
      } catch (err) {
        setAlert({ type: 'error', message: 'Failed to load moderation data' });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleModerateVideo = async (id, action) => {
    try {
      await moderatorAPI.moderateVideo(id, action);
      setPendingUploads(prev => prev.filter(u => u._id !== id));
      setAlert({ type: 'success', message: `Video ${action}d successfully` });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Action failed' });
    }
  };

  const handleResolveReport = async (id) => {
    try {
      await adminAPI.resolveReport(id, { status: 'resolved' });
      setReports(prev => prev.filter(r => r._id !== id));
      setAlert({ type: 'success', message: 'Report resolved' });
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.error || 'Failed to resolve' });
    }
  };

  return (
    <main className="dashboard-page">
      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}
      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <p className="dashboard-sidebar-title">Moderation</p>
          <nav className="dashboard-nav">
            <button onClick={() => setActiveTab('overview')} className={`dashboard-nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <DashboardIcon size={18} /> Overview
            </button>
            <button onClick={() => setActiveTab('uploads')} className={`dashboard-nav-item ${activeTab === 'uploads' ? 'active' : ''}`}>
              <FilmIcon size={18} /> Pending Uploads
            </button>
            <button onClick={() => setActiveTab('reports')} className={`dashboard-nav-item ${activeTab === 'reports' ? 'active' : ''}`}>
              <FlagIcon size={18} /> Reports
            </button>
          </nav>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-header">
            <h1 className="dashboard-header-title">Moderator Dashboard</h1>
            <p className="dashboard-header-subtitle">Review and moderate content</p>
          </div>

          {activeTab === 'overview' && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Pending Uploads</span>
                  <div className="stat-card-icon amber"><FilmIcon size={20} /></div>
                </div>
                <div className="stat-card-value">{pendingUploads.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-header">
                  <span className="stat-card-label">Active Reports</span>
                  <div className="stat-card-icon red"><FlagIcon size={20} /></div>
                </div>
                <div className="stat-card-value">{reports.length}</div>
              </div>
            </div>
          )}

          {activeTab === 'uploads' && (
            <div className="data-table-container">
              <div className="data-table-header">
                <h3 className="data-table-title">Pending Uploads</h3>
              </div>
              {loading ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
              ) : pendingUploads.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>No pending uploads</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Video</th>
                      <th>Creator</th>
                      <th>Uploaded</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUploads.map(upload => (
                      <tr key={upload._id}>
                        <td>
                          <div className="table-user">
                            <img src={upload.thumbnail} alt="" style={{ width: 60, height: 36, borderRadius: 4, objectFit: 'cover' }} />
                            <span className="table-user-name truncate">{upload.title}</span>
                          </div>
                        </td>
                        <td>{upload.creator?.username}</td>
                        <td>{formatTimeAgo(upload.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleModerateVideo(upload._id, 'approve')} className="table-action-btn" style={{ color: 'var(--primary)' }}>
                              <CheckIcon size={16} />
                            </button>
                            <button onClick={() => handleModerateVideo(upload._id, 'reject')} className="table-action-btn danger">
                              <XIcon size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="data-table-container">
              <div className="data-table-header">
                <h3 className="data-table-title">Reports Queue</h3>
              </div>
              {loading ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
              ) : reports.length === 0 ? (
                <div className="p-6 text-center" style={{ color: 'var(--text-muted)' }}>No active reports</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Reporter</th>
                      <th>Reason</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map(report => (
                      <tr key={report._id}>
                        <td><span className="badge badge-warning">{report.type}</span></td>
                        <td>{report.reporter?.username}</td>
                        <td>{report.reason}</td>
                        <td>{formatTimeAgo(report.createdAt)}</td>
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleResolveReport(report._id)} className="table-action-btn" style={{ color: 'var(--primary)' }}>
                              <CheckIcon size={16} />
                            </button>
                            <button className="table-action-btn danger"><BanIcon size={16} /></button>
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
