import { useState, useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { getInitials } from '../utils/getInitials';

export default function ChatWindow({ 
  currentUser, 
  activeContact, 
  messages, 
  onSendMessage, 
  isTyping, 
  contacts,
  sendTyping
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const contactInfo = contacts.find(c => c.username === activeContact);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
    sendTyping();
    
    // Auto resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  if (!activeContact) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <h2>Welcome to ChatDS</h2>
          <p>Select a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="avatar-container">
          <div className="avatar">{getInitials(activeContact)}</div>
          {contactInfo?.isOnline && <div className="online-indicator"></div>}
        </div>
        <div className="header-info">
          <h3>{activeContact}</h3>
          <span className="status-text">
            {isTyping ? 'typing...' : (contactInfo?.isOnline ? 'Online' : 'Offline')}
          </span>
        </div>
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
             <div key={index}>
               <MessageBubble message={msg} isOwn={msg.sender === currentUser} />
             </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={handleSubmit}>
          <textarea
            value={inputText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            rows="1"
          />
          <button type="submit" disabled={!inputText.trim()} className="send-btn">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
