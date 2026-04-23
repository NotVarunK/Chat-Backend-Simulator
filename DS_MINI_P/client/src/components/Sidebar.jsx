import { useState } from 'react';
import { getInitials } from '../utils/getInitials';
import ContactModal from './ContactModal';

export default function Sidebar({ 
  currentUser, 
  contacts, 
  activeContact, 
  selectContact, 
  unreadCounts, 
  typingUsers,
  addContact 
}) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredContacts = contacts.filter(c => 
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>ChatDS</h2>
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search contacts..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="contact-list">
        {filteredContacts.map(contact => (
          <div 
            key={contact.username} 
            className={`contact-item ${activeContact === contact.username ? 'active' : ''}`}
            onClick={() => selectContact(contact.username)}
          >
            <div className="avatar-container">
              <div className="avatar">{getInitials(contact.username)}</div>
              {contact.isOnline && <div className="online-indicator"></div>}
            </div>
            
            <div className="contact-info">
              <div className="contact-top">
                <span className="contact-name">{contact.username}</span>
              </div>
              <div className="contact-bottom">
                <span className="contact-preview">
                  {typingUsers[contact.username] ? (
                    <span className="typing-text">typing...</span>
                  ) : (
                    contact.lastMessage ? contact.lastMessage.content : ''
                  )}
                </span>
                {unreadCounts[contact.username] > 0 && (
                  <span className="unread-badge">{unreadCounts[contact.username]}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="current-user">
          <div className="avatar">{getInitials(currentUser)}</div>
          <span>{currentUser}</span>
        </div>
        <button className="btn-new-contact" onClick={() => setIsModalOpen(true)}>
          + New Contact
        </button>
      </div>

      <ContactModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={addContact} 
      />
    </div>
  );
}
