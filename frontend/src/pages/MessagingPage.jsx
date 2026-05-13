import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { messageAPI } from '../api/message';
import { SearchIcon, SendIcon, MoreIcon } from '../components/Icons';
import { formatTimeAgo } from '../utils/constants';

export default function MessagingPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        const res = await messageAPI.getConversations();
        setConversations(res.data.data?.conversations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      const loadMessages = async () => {
        try {
          const res = await messageAPI.getMessages(activeConversation.user._id);
          setMessages(res.data.data?.messages || []);
        } catch (err) {
          console.error(err);
        }
      };
      loadMessages();
    }
  }, [activeConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConversation) return;
    try {
      const res = await messageAPI.sendMessage(activeConversation.user._id, messageText.trim());
      setMessages(prev => [...prev, res.data.data?.message]);
      setMessageText('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="messaging-page">
      <div className="messaging-layout">
        {/* Conversations Sidebar */}
        <div className="conversations-sidebar">
          <div className="conversations-header">
            <h2 className="conversations-title">Messages</h2>
            <div className="conversations-search">
              <SearchIcon size={16} style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search conversations..." />
            </div>
          </div>
          <div className="conversations-list">
            {loading ? (
              <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>Loading...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>No conversations yet</div>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.user._id}
                  className={`conversation-item ${activeConversation?.user._id === conv.user._id ? 'active' : ''} ${conv.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => setActiveConversation(conv)}
                >
                  <div className="conversation-avatar">
                    <img src={conv.user.avatar || '/default-avatar.png'} alt="" />
                    {conv.user.isOnline && <div className="conversation-online"></div>}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-name">
                      {conv.user.username}
                      <span className="conversation-time">{formatTimeAgo(conv.lastMessage?.createdAt)}</span>
                    </div>
                    <p className="conversation-preview">{conv.lastMessage?.text || 'No messages yet'}</p>
                  </div>
                  {conv.unreadCount > 0 && <div className="conversation-unread">{conv.unreadCount}</div>}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {activeConversation ? (
            <>
              <div className="chat-header">
                <div className="chat-header-avatar">
                  <img src={activeConversation.user.avatar || '/default-avatar.png'} alt="" />
                </div>
                <div className="chat-header-info">
                  <p className="chat-header-name">{activeConversation.user.username}</p>
                  <p className="chat-header-status">{activeConversation.user.isOnline ? 'Online' : 'Offline'}</p>
                </div>
                <div className="chat-header-actions">
                  <button className="chat-header-btn"><MoreIcon size={18} /></button>
                </div>
              </div>

              <div className="messages-container">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`message-group ${msg.sender === user?.id ? 'sent' : 'received'}`}>
                    <div className="message-bubble">{msg.text}</div>
                    <span className="message-time">{formatTimeAgo(msg.createdAt)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="chat-input-area">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="chat-input"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button type="submit" disabled={!messageText.trim()} className="chat-send-btn">
                  <SendIcon size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="empty-chat">
              <div className="empty-chat-icon">💬</div>
              <h3 className="empty-chat-title">Select a conversation</h3>
              <p className="empty-chat-desc">Choose a conversation from the sidebar to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
