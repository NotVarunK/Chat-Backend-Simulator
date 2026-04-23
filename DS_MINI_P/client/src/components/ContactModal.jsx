import { useState } from 'react';

export default function ContactModal({ isOpen, onClose, onAdd }) {
  const [username, setUsername] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onAdd(username.trim());
      setUsername('');
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Add Contact / Join Group</h2>
        <p className="subtitle">Enter a username or an existing group name</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username or Group Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={!username.trim()}>Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}
