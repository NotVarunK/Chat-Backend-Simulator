import { useState } from 'react';

export default function Login({ onLogin, error }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>ChatDS</h1>
        <p className="subtitle">Enter a username to join the chat</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" disabled={!username.trim()}>Enter Chat</button>
        </form>
      </div>
      <div className="floating-particles"></div>
    </div>
  );
}
