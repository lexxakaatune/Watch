import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationRead } from '../store/slices/notificationSlice';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import { BellIcon, HeartIcon, MessageSquareIcon, UserIcon, UploadIcon, CheckIcon } from '../components/Icons';
import { formatTimeAgo } from '../utils/constants';

export default function NotificationsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.notification);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchNotifications());
  }, [dispatch, isAuthenticated]);

  const getIcon = (type) => {
    switch (type) {
      case 'like': return <div className="notification-icon like"><HeartIcon size={18} /></div>;
      case 'comment': return <div className="notification-icon comment"><MessageSquareIcon size={18} /></div>;
      case 'follow': return <div className="notification-icon follow"><UserIcon size={18} /></div>;
      case 'upload': return <div className="notification-icon upload"><UploadIcon size={18} /></div>;
      default: return <div className="notification-icon system"><BellIcon size={18} /></div>;
    }
  };

  const handleMarkRead = (id) => {
    dispatch(markNotificationRead(id));
  };

  return (
    <main className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1 className="notifications-title">Notifications</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12" style={{ color: 'var(--text-muted)' }}>Loading...</div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔔</div>
            <h3 className="empty-title">No notifications</h3>
            <p className="empty-desc">You&apos;re all caught up!</p>
          </div>
        ) : (
          items.map(notification => (
            <div
              key={notification._id}
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => !notification.read && handleMarkRead(notification._id)}
            >
              {getIcon(notification.type)}
              <div className="notification-content">
                <p className="notification-text" dangerouslySetInnerHTML={{ __html: notification.message }} />
                <span className="notification-time">{formatTimeAgo(notification.createdAt)}</span>
              </div>
              {!notification.read && <div className="notification-unread-dot"></div>}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
