import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { api } from '../redux/store'

export default function Messages() {
  const { user } = useSelector(state => state.auth)
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.user._id)
    }
  }, [activeConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations')
      setConversations(res.data.data.conversations || [])
    } catch (err) {
      console.error('Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (userId) => {
    try {
      const res = await api.get(`/messages/${userId}`)
      setMessages(res.data.data.messages || [])
    } catch (err) {
      console.error('Failed to load messages')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation) return
    try {
      const res = await api.post(`/messages/${activeConversation.user._id}`, { text: newMessage })
      setMessages([...messages, res.data.data.message])
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message')
    }
  }

  if (loading) {
    return (
      <div className="messaging-page flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div className="messaging-page">
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <h2>Messages</h2>
        </div>
        <div className="conversations-list">
          {conversations.length === 0 && (
            <div className="p-4 text-center text-sm text-[var(--text-muted)]">
              No conversations yet
            </div>
          )}
          {conversations.map(conv => (
            <button
              key={conv.user._id}
              className={`conversation-item w-full text-left ${activeConversation?.user._id === conv.user._id ? 'active' : ''}`}
              onClick={() => setActiveConversation(conv)}
            >
              <img src={conv.user.avatar || '/default-avatar.png'} alt={conv.user.username} className="conversation-avatar" />
              <div className="conversation-info">
                <div className="conversation-name">{conv.user.username}</div>
                <div className="conversation-preview">{conv.lastMessage?.text || 'No messages'}</div>
              </div>
              <div className="conversation-meta">
                <span className="conversation-time">
                  {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
                {conv.unread > 0 && <span className="unread-badge">{conv.unread}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="chat-area">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <img src={activeConversation.user.avatar || '/default-avatar.png'} alt={activeConversation.user.username} className="w-10 h-10 rounded-full object-cover" />
              <div className="chat-header-info">
                <h3>{activeConversation.user.username}</h3>
                <p>Online</p>
              </div>
            </div>
            <div className="messages-container">
              {messages.map(msg => (
                <div key={msg._id} className={`message-bubble ${msg.sender._id === user?.id ? 'sent' : 'received'}`}>
                  <p>{msg.text}</p>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.sender._id === user?.id && (
                      <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
              <form onSubmit={sendMessage} className="chat-form">
                <textarea
                  className="chat-input"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage(e)
                    }
                  }}
                  rows={1}
                />
                <button type="submit" className="chat-send-btn" disabled={!newMessage.trim()}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" className="mx-auto mb-4"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <h3 className="text-lg font-semibold text-[var(--text-secondary)]">Select a conversation</h3>
              <p className="text-sm text-[var(--text-muted)] mt-1">Choose someone to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
