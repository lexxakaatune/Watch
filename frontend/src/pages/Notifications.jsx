import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { api, setAlert } from '../redux/store'

export default function Notifications() {
  const dispatch = useDispatch()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.data.notifications || [])
      setUnreadCount(res.data.data.unreadCount || 0)
    } catch (err) {
      console.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to mark as read' }))
    }
  }

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read')
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
      dispatch(setAlert({ type: 'success', message: 'All notifications marked as read' }))
    } catch (err) {
      dispatch(setAlert({ type: 'error', message: 'Failed to mark all as read' }))
    }
  }

  const getIcon = (type) => {
    switch (type) {
      case 'like': return '❤️'
      case 'comment': return '💬'
      case 'follow': return '👤'
      case 'upload': return '📹'
      case 'mention': return '@'
      case 'system': return '🔔'
      case 'moderation': return '🛡️'
      case 'payment': return '💰'
      case 'message': return '✉️'
      default: return '🔔'
    }
  }

  if (loading) {
    return (
      <div className="notifications-page min-h-screen flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications {unreadCount > 0 && <span className="badge badge-green ml-2">{unreadCount}</span>}</h1>
          {unreadCount > 0 && (
            <button className="btn btn-sm btn-ghost" onClick={markAllRead}>
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" className="mx-auto mb-4"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <h3>No notifications yet</h3>
            <p>When you get notifications, they will appear here</p>
          </div>
        ) : (
          <div>
            {notifications.map(notification => (
              <div
                key={notification._id}
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => !notification.isRead && markAsRead(notification._id)}
              >
                {notification.sender ? (
                  <img src={notification.sender.avatar || '/default-avatar.png'} alt={notification.sender.username} className="notification-avatar" />
                ) : (
                  <div className={`notification-icon ${notification.type}`}>{getIcon(notification.type)}</div>
                )}
                <div className="notification-body">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">{notification.message}</div>
                  <div className="notification-time">{new Date(notification.createdAt).toLocaleDateString()}</div>
                </div>
                {!notification.isRead && <div className="notification-dot" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
